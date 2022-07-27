import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { TranslateService } from '@ngx-translate/core';
import Chart from 'chart.js/auto'
import * as L from 'leaflet';
import { LatLng } from 'leaflet';
import { Session } from 'src/app/models/Session';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  sessions : Session[] = []
  dataHasLoaded : boolean = false;
  pieChart! : Chart;
  pieChartAlreadyBuilt = false;
  ifvClasseSelected : number = 0;
  icapexSelected : string = "";
  dateCreaSelected : string=  "";
  dateModifSelected : string=  "";
  parcelleSelected : string=  "";
  

  @ViewChild('drawer') public drawer: MatDrawer | undefined;

  //TRAD OBJECTS
  graphFullGrowth  = { key : "graphFullGrowth", value : ""};
  graphSlowedGrowth  = { key : "graphSlowedGrowth", value : ""};
  graphGrowthArrest  = { key : "graphGrowthArrest", value : ""};
  tabOfVars = [this.graphFullGrowth, this.graphSlowedGrowth, this.graphGrowthArrest];

  constructor(
    private sessionService : SessionService,
    private _translate: TranslateService,
    ) { }

  ngOnInit(): void {
    this._translateLanguage();
    this.sessionService.retrieveData().then( (res) => {
      this.sessions = res as Session[];
      console.log("sessions finales : "+JSON.stringify(this.sessions));
      this.setUpMap();
    })
    .catch(error => {
      console.log(error)
    })
  }

  _translateLanguage(): void {
    this._translate.use("fr");
    for(const elem of this.tabOfVars){
      this._translate.get(elem.key).subscribe( res => {
        elem.value = res;
      })
    }
  }

  setUpMap(){
    let center = new LatLng(this.sessions[0].moyLat, this.sessions[0].moyLong);
    const map = L.map('map').setView(center, 13);
    L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
      maxZoom: 20,
      subdomains:['mt0','mt1','mt2','mt3']
    }).addTo(map);
    for(const session of this.sessions){
      let marker = L.marker([session.moyLat, session.moyLong], {
      }).addTo(map);
      marker.bindPopup("Session réalisée le : <b>"+session.date_creation +"</b><br>"+
      "Sur la parcelle : <b>"+session.nom_parcelle +"</b><br>"+
      "<b>(dernière mise à jour le "+session.date_maj +")</b><br>", {
        closeButton: false
      });
      marker.on('mouseover',function(ev) {
        marker.openPopup()
      });
      marker.on('mouseout',function(ev) {
        marker.closePopup()
      });
      marker.on('click',(ev)=>{
        console.log('session parcelle: '+session.nom_parcelle);
        this.ifvClasseSelected = session.ifvClasse;
        this.icapexSelected = session.ic_apex;
        this.dateCreaSelected = session.date_creation;
        this.dateModifSelected = session.date_maj;
        this.parcelleSelected = session.nom_parcelle;
        this.computePieChart(session);
        this.drawer?.open();
     })
    }
  }

  computePieChart(session : Session){
    if(this.pieChartAlreadyBuilt){
      this.pieChart.destroy();
    }
    this.pieChart = new Chart(document.getElementById('pieChart') as HTMLCanvasElement, {
      type: 'pie',
      data: {
          labels: [session.apexValues[0] + this.graphFullGrowth.value, session.apexValues[1] + this.graphSlowedGrowth.value, session.apexValues[2] + this.graphGrowthArrest.value],
          datasets: [{
            backgroundColor: [
              '#2C6109',
              '#6E9624',
              '#C5DC68'
            ],
            borderColor: [
              'rgba(255, 255, 255, 1)',
              'rgba(255, 255, 255, 1)',
              'rgba(255, 255, 255, 1)'
            ],
            data: session.apexValues,
            borderWidth: 1
          }]
     },
     options: {
      hover: {mode: undefined},
      animation: {
        duration: 0
      },
      // plugins : {
      //   legend : {
      //     position : 'left'
      //   }
      // },
      responsive: true,
      // SI ON VEUT METTRE EN IMAGE, PREFERER :
      // responsive: true,
      // height: 80,
      // width: 150,
      maintainAspectRatio: false,
      }
    });
    this.pieChartAlreadyBuilt = true;
  }

}
