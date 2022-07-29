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

  sessions : Session[] = [];
  years : string[] = [];
  dataHasLoaded : boolean = false;
  map! : L.Map;
  pieChart! : Chart;
  pieChartAlreadyBuilt = false;
  ifvClasseSelected : number = 0;
  icapexSelected : string = "";
  dateCreaSelected : string=  "";
  dateModifSelected : string=  "";
  nameOfparcelleSelected : string=  "";
  idOfparcelleSelected : string = "";
  campagneSelected : string = "";
  drawerOpened = false;
  

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
    this.sessionService.retrieveCampagnesData().then( (res) => {
      this.years = res as string[];
      this.campagneSelected = this.years[0]; //Most recent year
      this.sessionService.retrieveSessionsData(this.years[0]).then( (res) => {
        this.sessions = res as Session[];
        this.setUpMap();
      })
      .catch(error => {
        console.log(error)
      })
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
    this.map = L.map('map').setView(center, 1);
    let tabOfLimitPoints = this.computeLimitPoint();
    //SET THE ZOOM CORRECTLY WITH THE MOST DISTANT POINTS
    this.map.fitBounds(new L.LatLngBounds(
      [tabOfLimitPoints[0], tabOfLimitPoints[1]], 
      [tabOfLimitPoints[2], tabOfLimitPoints[3]]));
    //BECAUSE SIZE OF MAP IS REDUCES IN SCSS : -1 ZOOM
    this.map.setZoom(this.map.getZoom()-1);
    L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
      maxZoom: 22,
      subdomains:['mt0','mt1','mt2','mt3']
    }).addTo(this.map);
    this.map.on('container-resize', (ev) => {
      console.log("container resize")
      setTimeout( () => { 
        console.log("timeout done");
        this.map.invalidateSize();
      }, 400);
    });
    for(const session of this.sessions){
      let marker = L.marker([session.moyLat, session.moyLong], {
        riseOnHover : true,
      }).addTo(this.map);
      marker.bindPopup("Session réalisée le : <b>"+session.date_session +"</b><br>"+
      "Sur la parcelle : <b>"+session.nom_parcelle +"</b><br>"+
      "<i>(dernière mise à jour le "+session.date_maj +")</i><br>", {
        closeButton: false
      });
      marker.on('mouseover',function(ev) {
        marker.openPopup()
      });
      marker.on('mouseout',function(ev) {
        marker.closePopup()
      });
      marker.on('click',(ev)=>{
        this.ifvClasseSelected = session.ifvClasse;
        this.icapexSelected = session.ic_apex;
        this.dateCreaSelected = session.date_session;
        this.dateModifSelected = session.date_maj;
        this.nameOfparcelleSelected = session.nom_parcelle;
        this.idOfparcelleSelected = session.id_parcelle;
        this.computePieChart(session);
        this.drawer?.open();
        if(!this.drawerOpened){
          this.drawerOpened = true;
          setTimeout( () => {
            this.map.invalidateSize();
            if(this.map.getZoom() < 17 ){
              this.map.setZoomAround([session.moyLat, session.moyLong], 17);
              this.map.flyTo([session.moyLat, session.moyLong]);
            }
            this.map.flyTo([session.moyLat, session.moyLong]);
          }, 400)
        }
        else{
          if(this.map.getZoom() < 17 ){
            this.map.setZoomAround([session.moyLat, session.moyLong], 17);
            this.map.flyTo([session.moyLat, session.moyLong]);
          }
          this.map.flyTo([session.moyLat, session.moyLong]);
        }
     })
    }
  }

  closeDrawer(){
    this.drawer?.close();
    this.drawerOpened = false;
    setTimeout( () => {this.map.invalidateSize()}, 400)
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

  changeCampagne(year : string){
    this.map.off();
    this.map.remove();
    let previousCampagneSelected = this.campagneSelected;
    this.campagneSelected = year;
    this.sessionService.retrieveSessionsData(year).then( (res) => {
      this.sessions = res as Session[];
      this.setUpMap();
    })
    .catch(error => {
      console.log(error)
      this.campagneSelected = previousCampagneSelected;
    })
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
          labels: [session.apexValues[0] + '% Pleine croissance', session.apexValues[1] + '% Croissance ralentie', session.apexValues[2] + '% Arrêt de croissance'],
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
