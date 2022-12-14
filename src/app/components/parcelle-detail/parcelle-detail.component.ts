import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Campagne } from 'src/app/models/Campagne';
import { Session } from 'src/app/models/Session';
import { SessionService } from 'src/app/services/session.service';
import {  Chart, ChartType} from 'chart.js';

@Component({
  selector: 'app-parcelle-detail',
  templateUrl: './parcelle-detail.component.html',
  styleUrls: ['./parcelle-detail.component.scss']
})
export class ParcelleDetailComponent implements OnInit {

  croissanceChart! : Chart;
  contrainteChart! : Chart;

  croissanceChartBuilt = false;
  contrainteChartBuilt = false;

  idParcelle : string = "";
  campagnes : Campagne[] = [];
  sessions : Session[] = [];
  detailsLoaded = false;
  campagneSelected : string = "";

  constructor(
    private route: ActivatedRoute,
    private sessionService : SessionService,
    ) { }

  ngOnInit(): void {
    this.idParcelle = this.route.snapshot.paramMap.get('idparcelle')!;
    this.campagneSelected = this.route.snapshot.paramMap.get('campagne')!;
    this.sessionService.retrieveParcelleCampagnesData(this.idParcelle).then( (res) => {
      this.campagnes = res as Campagne[];
      this.sessionService.retrieveDetailsParcelleData(this.idParcelle, this.campagneSelected).then((res) => {
        this.sessions = res as Session[];
        this.makeChartCroissance();
        this.makeChartContrainte();
        this.detailsLoaded = true;
      })
      .catch(error => {
        this.detailsLoaded = true;
        console.log("ERROR WHILE RETRIEVING PARCELLE DETAILS DATA : "+error);
      })
    })
    .catch(error => {
      this.detailsLoaded = true;
      console.log("ERROR WHILE RETRIEVING CAMPAGNES DATA : "+error);
    })
  }
  changeCampagne(year : string){
    this.detailsLoaded = false;
    let previousCampagneSelected = this.campagneSelected;
    this.campagneSelected = year;
    this.sessionService.retrieveDetailsParcelleData(this.idParcelle, this.campagneSelected).then( (res) => {
      this.sessions = res as Session[];
      this.detailsLoaded = true;
      this.makeChartCroissance();
      this.makeChartContrainte();
    })
    .catch(error => {
      this.detailsLoaded = true;
      this.campagneSelected = previousCampagneSelected;
      console.log("ERROR WHILE RETRIEVING PARCELLES DETAILS DATA : "+error);
    })
  }

  public makeChartCroissance() {
    if(this.croissanceChartBuilt){
      this.croissanceChart.destroy();
    }
    let dates = [];
    let icApexs = [];
    let purcentApexs0 = [];
    let purcentApexs1 = [];
    let purcentApexs2 = [];
    for(const session of this.sessions){
      dates.push(session.date_session);
      icApexs.push(parseFloat(session.ic_apex));
      purcentApexs0.push(session.tauxApex0);
      purcentApexs1.push(session.tauxApex1);
      purcentApexs2.push(session.tauxApex2);
    }
    this.croissanceChart = new Chart(document.getElementById('croissance') as HTMLCanvasElement, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
            label: 'iC-Apex',
            yAxisID: 'A',
            fill: false,
            backgroundColor: 'rgba(242, 142, 146, 0.2)',
            borderColor: 'rgb(242, 142, 146)',
            borderCapStyle: 'square',
            borderDash: [], // try [5, 15] for instance
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: 'black',
            pointBackgroundColor: 'white',
            pointBorderWidth: 1,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: 'rgb(242, 142, 146)',
            pointHoverBorderColor: 'white',
            pointHoverBorderWidth: 2,
            pointRadius: 4,
            pointHitRadius: 10,
            data: icApexs
          },
          {
            label: '% Pleine croissance',
            yAxisID: 'B',
            fill: true,
            hidden: true,
            backgroundColor: 'rgba(247, 201, 161, 0.2)',
            borderColor: 'rgb(247, 201, 161)', // The main line color
            borderCapStyle: 'square',
            borderDash: [5, 5], // try [5, 15] for instance
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: 'black',
            pointBackgroundColor: 'white',
            pointBorderWidth: 1,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: 'rgb(247, 201, 161)',
            pointHoverBorderColor: 'white',
            pointHoverBorderWidth: 2,
            pointRadius: 4,
            pointHitRadius: 10,
            data: purcentApexs0
          },
          {
            label: '% Croissance ralentie',
            yAxisID: 'B',
            fill: true,
            hidden: false,
            backgroundColor: 'rgba(144, 190, 184, 0.2)',
            borderColor: 'rgb(144, 190, 184)', // The main line color
            borderCapStyle: 'square',
            borderDash: [5, 5], // try [5, 15] for instance
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: 'black',
            pointBackgroundColor: 'white',
            pointBorderWidth: 1,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: 'rgb(144, 190, 184)',
            pointHoverBorderColor: 'white',
            pointHoverBorderWidth: 2,
            pointRadius: 4,
            pointHitRadius: 10,
            data: purcentApexs1
          },
          {
            label: '% Arr??t de croissance',
            yAxisID: 'B',
            fill: true,
            hidden: true,
            backgroundColor: 'rgba(105, 134, 143, 0.2)',
            borderColor: 'rgb(105, 134, 143)', // The main line color
            borderCapStyle: 'square',
            borderDash: [5, 5], // try [5, 15] for instance
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: 'black',
            pointBackgroundColor: 'white',
            pointBorderWidth: 1,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: 'rgb(105, 134, 143)',
            pointHoverBorderColor: 'white',
            pointHoverBorderWidth: 2,
            pointRadius: 4,
            pointHitRadius: 10,
            data: purcentApexs2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins : {
          legend : {
            position : 'bottom'
          }
        },
        scales: {
          xAxes : {
            suggestedMax: 5
          },
        }
      }
    });
    this.croissanceChartBuilt = true;
  }

  public makeChartContrainte() {
    if(this.contrainteChartBuilt){
      this.contrainteChart.destroy();
    }
    let dates = [];
    let contraintes = [];
    for(const session of this.sessions){
      dates.push(session.date_session);
      contraintes.push(session.ifvClasse);
    }
    this.contrainteChart = new Chart(document.getElementById('contrainte') as HTMLCanvasElement, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
            label: 'Niveau contrainte hydrique',
            fill: true,
            backgroundColor: 'rgba(151, 162, 191, 0.2)',
            borderColor: 'rgb(151, 162, 191)',
            borderCapStyle: 'square',
            borderDash: [], // try [5, 15] for instance
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: 'black',
            pointBackgroundColor: 'white',
            pointBorderWidth: 1,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: 'rgb(151, 162, 191)',
            pointHoverBorderColor: 'white',
            pointHoverBorderWidth: 2,
            pointRadius: 4,
            pointHitRadius: 10,
            data: contraintes
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins : {
          legend : {
            position : 'bottom'
          }
        },
        scales: {
          xAxes: {
            suggestedMax: 5
          },
          y: {
            ticks: {
              stepSize: 1,
              callback: function(value : any, index : any, ticks : any) {   
                switch (value) {
                  case 0:
                      return 'Absente';
                  case 1:
                      return 'Mod??r??e';
                  case 2:
                      return 'Forte';
                  case 3:
                      return 'S??v??re';
                  default :
                    return 'Inconnue';
                }
              }
            }
          }
        }
      }
    });
    this.contrainteChartBuilt = true;
  }
}
