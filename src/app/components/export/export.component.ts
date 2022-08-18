import { Component, OnInit } from '@angular/core';
import { Campagne } from 'src/app/models/Campagne';
import { Parcelle } from 'src/app/models/Parcelle';
import { ParcelleService } from 'src/app/services/parcelle.service';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss']
})
export class ExportComponent implements OnInit {

  campagnes : Campagne[] = [];
  campagneSelected : string = "";
  parcellesOwned : Parcelle[] = [];
  parcellesShared : Parcelle[] = [];

  exportingCSV : boolean = false;
  exportingPDF : boolean = false;

  dataHasLoaded : boolean = false;

  constructor(
    private sessionService : SessionService,
    private parcelleService : ParcelleService,
    ) { }

  ngOnInit(): void {
    this.sessionService.retrieveCampagnesData().then( (res) => {
      this.campagnes = res as Campagne[];
      this.campagneSelected = this.campagnes[0].year; //Most recent year
      this.parcelleService.retrieveParcellesOwnedData(this.campagneSelected).then( (res) => {
        this.parcellesOwned = res as Parcelle[];
        this.parcelleService.retrieveParcellesSharedData(this.campagneSelected).then( (res) => {
          this.parcellesShared = res as Parcelle[];
        })
        .catch(error => {
          console.log("ERROR WHILE RETRIEVING SHARED PARCELLES DATA : "+error);
        })
      })
      .catch(error => {
        console.log("ERROR WHILE RETRIEVING OWNED PARCELLES DATA : "+error);
      })
    })
    .catch(error => {
      console.log("ERROR WHILE RETRIEVING CAMPAGNES DATA : "+error);
    })
  }

  changeCampagne(year : string){
    this.dataHasLoaded = false;
    let previousCampagneSelected = this.campagneSelected;
    this.campagneSelected = year;
  }

  exportCSV(){

  }

  exportPDF(){

  }

  // setAll(completed: boolean) {
  //   this.allComplete = completed;
  //   if (this.task.subtasks == null) {
  //     return;
  //   }
  //   this.task.subtasks.forEach(t => (t.completed = completed));
  // }
}
