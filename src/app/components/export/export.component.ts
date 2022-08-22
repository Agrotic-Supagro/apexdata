import { Component, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Campagne } from 'src/app/models/Campagne';
import { Parcelle } from 'src/app/models/Parcelle';
import { Session } from 'src/app/models/Session';
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
  parcellesObserved : Parcelle[] = [];
  parcellesShared : Parcelle[] = [];

  //Parcelle : Boolean (true if selected in DOM)
  parcellesObservedSelected = new Map();
  allObservedSelected : boolean = false;

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
      this.parcelleService.retrieveObservedParcellesData(this.campagneSelected).then( (res) => {
        this.parcellesObserved = res as Parcelle[];
        //A ENLEVER
        this.dataHasLoaded = true;
        // this.parcelleService.retrieveParcellesSharedData(this.campagneSelected).then( (res) => {
        //   let tab = res as Parcelle[];
        //   for(const parcelle of tab){
        //     this.parcellesShared.set(parcelle.id_parcelle, parcelle);
        //   }
        //   this.dataHasLoaded = true;
        // })
        // .catch(error => {
        //   this.dataHasLoaded = true;
        //   console.log("ERROR WHILE RETRIEVING SHARED PARCELLES DATA : "+error);
        // })
      })
      .catch(error => {
        this.dataHasLoaded = true;
        console.log("ERROR WHILE RETRIEVING OBSERVED PARCELLES DATA : "+error);
      })
    })
    .catch(error => {
      this.dataHasLoaded = true;
      console.log("ERROR WHILE RETRIEVING CAMPAGNES DATA : "+error);
    })
  }

  changeCampagne(year : string){
    this.dataHasLoaded = false;
    let previousCampagneSelected = this.campagneSelected;
    let previousParcelles = this.parcellesObserved;
    this.campagneSelected = year;
    this.dataHasLoaded = false;
    this.parcelleService.retrieveObservedParcellesData(this.campagneSelected).then( (res) => {
      this.parcellesObserved = res as Parcelle[];
      this.parcellesObservedSelected = new Map();
      //A ENLEVER
      this.dataHasLoaded = true;
      // this.parcelleService.retrieveParcellesSharedData(this.campagneSelected).then( (res) => {
      //   this.parcellesShared = new Map();
      //   let tab = res as Parcelle[];
      //   for(const parcelle of tab){
      //     this.parcellesShared.set(parcelle.id_parcelle, parcelle);
      //   }
      //   this.dataHasLoaded = true;
      // })
      // .catch(error => {
      //   this.dataHasLoaded = true;
      //   this.campagneSelected = previousCampagneSelected;
      //   this.parcellesOwned = previousParcelles;
      //   console.log("ERROR WHILE RETRIEVING SHARED PARCELLES DATA : "+error);
      // })
    })
    .catch(error => {
      this.dataHasLoaded = true;
      this.campagneSelected = previousCampagneSelected;
      console.log("ERROR WHILE RETRIEVING OBSERVED PARCELLES DATA : "+error);
    })
  }

  async exportCSV(){
    this.exportingCSV = true;
    let csv = 'Nom Parcelle, Date session, Pleine Croissance, Croissance Ralentie, Arrêt de croissance\n';
    let csvFileData: any[] = [];
    for (let [key, value] of this.parcellesObservedSelected) {
      if(value){
        await this.sessionService.retrieveSessionsExportData(this.campagneSelected, key).then((res) => {
          let sessions = res as Session[];
          for(const session of sessions){
            let sessionInfo = [session.nom_parcelle, session.date_session, session.apex0, session.apex1, session.apex2];
            csvFileData.push(sessionInfo);
          }
        })
      }
    }
    csvFileData.forEach(function(row) {  
      csv += row.join(',');  
      csv += "\n";  
    });
    var hiddenElement = document.createElement('a');  
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);  
    hiddenElement.download = 'Données Sessions ApeX.csv';  
    hiddenElement.click(); 
    this.exportingCSV = false;
  }

  exportPDF(){

  }

  nothingSelected(){
    return this.parcellesObservedSelected.size === 0;
  }

  checkParcelle(event : MatCheckboxChange, parcelle: Parcelle) {
    if(event.checked){
      this.parcellesObservedSelected.set(parcelle.id_parcelle, true);
    }
    else{
      if(this.parcellesObservedSelected.has(parcelle.id_parcelle)) {
        this.parcellesObservedSelected.delete(parcelle.id_parcelle);
      }
    }
  }

  checkSelected(parcelle : Parcelle){
    if(this.parcellesObservedSelected.size == this.parcellesObserved.length){
      return true;
    }
    else if(this.parcellesObservedSelected.get(parcelle?.id_parcelle) == true){
      return true;
    }
    else{
      return false;
    }
  }

  checkAllObservedSelected(){
    if(this.parcellesObservedSelected.size == this.parcellesObserved.length){
      return true;
    }
    else{
      return false;
    }
  }

  setAllObserved(event : boolean){
    if(event){
      for(const parcelle of this.parcellesObserved){
        if(!this.parcellesObservedSelected.has(parcelle.id_parcelle)){
          this.parcellesObservedSelected.set(parcelle.id_parcelle, true);
        }
      }
    }
    else{
      this.parcellesObservedSelected.clear();
    }
  }
  
}
