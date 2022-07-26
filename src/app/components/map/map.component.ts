import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
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

  @ViewChild('drawer') public drawer: MatDrawer | undefined;

  constructor(
    private sessionService : SessionService,
    ) { }

  ngOnInit(): void {
    this.sessionService.retrieveData().then( (res) => {
      this.sessions = res as Session[];
      console.log("sessions finales : "+JSON.stringify(this.sessions));
      this.setUpMap();
    })
    .catch(error => {
      console.log(error)
    })
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
      marker.bindPopup("Session créée le : <b>"+session.date_creation +"</b><br>"+
      "Dernière mise à jour : <b>"+session.date_maj +"</b><br>"+
      "Sur la parcelle : <b>"+session.nom_parcelle +"</b><br>", {
        closeButton: false
      });
      marker.on('mouseover',function(ev) {
        marker.openPopup()
      });
      marker.on('mouseout',function(ev) {
        marker.closePopup()
      });
      marker.on('click',(ev)=>{
        console.log('session : '+session.nom_parcelle);
        this.drawer?.toggle();
      })
    }
  }

}
