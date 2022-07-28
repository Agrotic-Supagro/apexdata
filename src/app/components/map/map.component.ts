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
  nameOfparcelleSelected : string=  "";
  idOfparcelleSelected : string = "";
  campagneSelected : string = "";
  

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
    let tabCenter = this.computeCenter();
    let center = new LatLng(tabCenter[0], tabCenter[1]);
    const map = L.map('map').setView(center, 1);
    let tabOfLimitPoints = this.computeLimitPoint();
    //SET THE ZOOM CORRECTLY WITH THE MOST DISTANT POINTS
    map.fitBounds(new L.LatLngBounds(
      [tabOfLimitPoints[0], tabOfLimitPoints[1]], 
      [tabOfLimitPoints[2], tabOfLimitPoints[3]]));
    L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
      maxZoom: 18,
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
        this.nameOfparcelleSelected = session.nom_parcelle;
        this.idOfparcelleSelected = session.id_parcelle;
        this.computePieChart(session);
        this.drawer?.open();
     })
    }
  }

  computeLimitPoint(){
    let minLat = 90;
    let maxLat = -90;
    let minLong = 180;
    let maxLong = -180;
    for(const session of this.sessions){
      if(minLat >= session.moyLat){
        minLat = session.moyLat;
      }
      if(maxLat <= session.moyLat){
        maxLat = session.moyLat;
      }
      if(minLong >= session.moyLong){
        minLong = session.moyLong;
      }
      if(maxLong <= session.moyLong){
        maxLong = session.moyLong;
      }
    }
    return [minLat, minLong, maxLat, maxLong];
  }

  getDistanceFromLatLonInKm(lat1 : number, lon1 : number, lat2 : number, lon2 : number) {
    var R = 6371; // Radius of the earth in km
    var dLat = this.deg2rad(lat2-lat1);  // deg2rad below
    var dLon = this.deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
  }

  deg2rad(deg : number) {
    return deg * (Math.PI/180)
  }

  changeCampagne(value : string){
    this.campagneSelected = "option1";
  }

  computeCenter(){
    let sumLat = 0;
    let sumLong = 0
    for(const session of this.sessions){
      sumLat = sumLat + session.moyLat;
      sumLong = sumLong + session.moyLong;
    }
    let moyenneLat = sumLat / this.sessions.length;
    let moyenneLong = sumLong / this.sessions.length;
    return [moyenneLat, moyenneLong];
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
      maintainAspectRatio: false,
      }
    });
    this.pieChartAlreadyBuilt = true;
  }

}
