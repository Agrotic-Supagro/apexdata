import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { TranslateService } from '@ngx-translate/core';
import Chart from 'chart.js/auto'
import * as L from 'leaflet';
import { LatLng } from 'leaflet';
import { map, Observable } from 'rxjs';
import { Session } from 'src/app/models/Session';
import { SessionService } from 'src/app/services/session.service';
import {MatStepper, StepperOrientation} from '@angular/material/stepper';
import {BreakpointObserver} from '@angular/cdk/layout';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  //stepperOrientation : Observable<StepperOrientation>;

  sessions : Session[] = [];
  years : string[] = [];
  weeks : any[] = [];
  firstDaysOfWeeks : string[] = [];
  dataHasLoaded : boolean = false;

  map! : L.Map;
  pieChart! : Chart;
  pieChartAlreadyBuilt = false;

  ifvClasseSelected : number = 0;
  icapexSelected : string = "";
  dynamiqueSelected : number = 2;
  dateSessionSelected : string=  "";
  dateModifSelected : string=  "";
  nameOfparcelleSelected : string=  "";
  idOfparcelleSelected : string = "";
  campagneSelected : string = "";
  weekSelected : string = "";

  drawerOpened = false;
  
  street = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 22,
    subdomains:['mt0','mt1','mt2','mt3']
  });
  satellite = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 22,
    subdomains:['mt0','mt1','mt2','mt3']
  });

  baseMaps = {
    "Vue Satellite": this.satellite,
    "Vue Street": this.street
  };

  // Max number of steps to show at a time in view
  MAX_STEP = 4;
  // Total steps included in mat-stepper in template
  totalSteps! : number;
  // Current page from paginator
  page = 0;
  // Current active step in mat-stepper
  step = 0;
  // Min index of step to show in view
  minStepAllowed = 0;
  // Max index of step to show in view
  maxStepAllowed = this.MAX_STEP - 1;
  // Number of total possible pages
  totalPages! : number;

  @ViewChild("stepper") private myStepper!: MatStepper;
  

  @ViewChild('drawer') public drawer: MatDrawer | undefined;

  //TRAD OBJECTS
  graphFullGrowth  = { key : "graphFullGrowth", value : ""};
  graphSlowedGrowth  = { key : "graphSlowedGrowth", value : ""};
  graphGrowthArrest  = { key : "graphGrowthArrest", value : ""};
  tabOfVars = [this.graphFullGrowth, this.graphSlowedGrowth, this.graphGrowthArrest];

  constructor(
    private sessionService : SessionService,
    private _translate: TranslateService,
    private breakpointObserver: BreakpointObserver,
    private elementRef: ElementRef,
    ) {

      // this.stepperOrientation = this.breakpointObserver
      //   .observe('(min-width: 1041px)') //1041px for 4 steps
      //   .pipe(map(({matches}) => (matches ? 'horizontal' : 'vertical')));
    }

  ngOnInit(): void {
    //this._translateLanguage();
    this.sessionService.retrieveCampagnesData().then( (res) => {
      this.years = res as string[];
      this.campagneSelected = this.years[0]; //Most recent year
      this.sessionService.retrieveWeeksData(this.campagneSelected).then( (res) => {
        this.weeks = res as any[];
        this.weekSelected = this.weeks[0].weekNumber; //Most older week
        this.totalSteps = this.weeks.length;
        this.totalPages = Math.ceil(this.totalSteps / this.MAX_STEP);
        this.sessionService.retrieveSessionsData(this.campagneSelected, this.weekSelected).then( (res) => {
          this.sessions = res as Session[];
          this.rerender();
          this.dataHasLoaded = true;
          this.setUpMap();
        })
        .catch(error => {
          console.log("ERROR WHILE RETRIEVING SESSIONS DATA : "+error);
        })
      })
      .catch(error => {
        console.log("ERROR WHILE RETRIEVING WEEKS DATA : "+error);
      })
    })
    .catch(error => {
      console.log("ERROR WHILE RETRIEVING CAMPAGNES DATA : "+error);
    })
  }

  ngAfterViewInit() {
    this.myStepper._getIndicatorType = () => 'number';
  }

  // _translateLanguage(): void {
  //   this._translate.use("fr");
  //   for(const elem of this.tabOfVars){
  //     this._translate.get(elem.key).subscribe( res => {
  //       elem.value = res;
  //     })
  //   }
  // }

  setUpMap(){
    let tabCenter = this.computeCenter();
    let center = new LatLng(tabCenter[0], tabCenter[1]);
    this.map = L.map('map').setView(center, 1);
    this.satellite.addTo(this.map);
    L.control.layers(this.baseMaps).addTo(this.map);
    let tabOfLimitPoints = this.computeLimitPoint();
    //SET THE ZOOM CORRECTLY WITH THE MOST DISTANT POINTS
    this.map.fitBounds(new L.LatLngBounds(
      [tabOfLimitPoints[0], tabOfLimitPoints[1]], 
      [tabOfLimitPoints[2], tabOfLimitPoints[3]]));
    //BECAUSE SIZE OF MAP IS REDUCES IN SCSS : -1 ZOOM
    this.map.setZoom(this.map.getZoom()-1);
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
        this.dateSessionSelected = session.date_session;
        this.dateModifSelected = session.date_maj;
        this.nameOfparcelleSelected = session.nom_parcelle;
        this.idOfparcelleSelected = session.id_parcelle;
        this.dynamiqueSelected = session.dynamique;
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
    this.dataHasLoaded = false;
    let previousCampagneSelected = this.campagneSelected;
    this.campagneSelected = year;
    this.sessionService.retrieveWeeksData(this.campagneSelected).then( (res) => {
      this.weeks = res as any[];
      let previousWeekSelected = this.weekSelected;
      this.weekSelected = this.weeks[0].weekNumber; //Most older week
      this.sessionService.retrieveSessionsData(this.campagneSelected, this.weekSelected).then( (res) => {
        this.map.off();
        this.map.remove();
        this.dataHasLoaded = true;
        this.sessions = res as Session[];
        this.setUpMap();
      })
      .catch(error => {
        console.log("ERROR WHILE RETRIEVING SESSIONS DATA : "+error);
        this.weekSelected = previousWeekSelected;
        this.campagneSelected = previousCampagneSelected;
      })
    })
    .catch(error => {
      console.log("ERROR WHILE RETRIEVING WEEKS DATA : "+error);
      this.campagneSelected = previousCampagneSelected;
    })
  }

  stepSelectionChange(event: StepperSelectionEvent) {
    this.step = event.selectedIndex;
    // console.log(
    //   " $event.selectedIndex: " +
    //     event.selectedIndex +
    //     "; Stepper.selectedIndex: " +
    //     this.myStepper.selectedIndex
    // );
    let stepLabel = event.selectedStep.label;
    let date = stepLabel.split(' ')[2];
    for(const week of this.weeks){
      if(week.firstDay == date){
        this.changeWeek(week.weekNumber);
      }
    }
  }

  changeWeek(weekNumber : string){
    this.dataHasLoaded = false;
    let previousWeekSelected = this.weekSelected;
    this.weekSelected = weekNumber;
    this.sessionService.retrieveSessionsData(this.campagneSelected, this.weekSelected).then( (res) => {
      this.map.off();
      this.map.remove();
      this.dataHasLoaded = true;
      this.sessions = res as Session[];
      this.setUpMap();
    })
    .catch(error => {
      console.log("ERROR WHILE RETRIEVING SESSIONS DATAaaa : "+error);
      this.weekSelected = previousWeekSelected;
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

  /**
   * Change the page in view
   */
   pageChangeLogic(isForward = true) {
    if (this.step < this.minStepAllowed || this.step > this.maxStepAllowed) {
      if (isForward) {
        this.page++;
      } else {
        this.page--;
      }
      this.changeMinMaxSteps(isForward);
    }
  }
  
  /**
   * This will change min max steps allowed at any time in view
   */
  changeMinMaxSteps(isForward = true) {
    const pageMultiple = this.page * this.MAX_STEP;

    // maxStepAllowed will be the least value between minStep + MAX_STEP and total steps
    // minStepAllowed will be the least value between pageMultiple and maxStep - MAX_STEP
    if (pageMultiple + this.MAX_STEP - 1 <= this.totalSteps - 1) {
      this.maxStepAllowed = pageMultiple + this.MAX_STEP - 1;
      this.minStepAllowed = pageMultiple;
    } else {
      this.maxStepAllowed = this.totalSteps - 1;
      this.minStepAllowed = this.maxStepAllowed - this.MAX_STEP + 1;
    }

    // This will set the next step into view after clicking on back / next paginator arrows
    if (this.step < this.minStepAllowed || this.step > this.maxStepAllowed) {
      if (isForward) {
        this.step = this.minStepAllowed;
      } else {
        this.step = this.maxStepAllowed;
      }
      this.myStepper.selectedIndex = this.step;
    }

    // console.log(
    //   `page: ${this.page + 1}, step: ${this.step + 1}, minStepAllowed: ${this
    //     .minStepAllowed + 1}, maxStepAllowed: ${this.maxStepAllowed + 1}`
    // );
    this.rerender();
  }
  
  /**
   * Function to go back a page from the current step
   */
  paginatorBack() {
    this.page--;
    this.changeMinMaxSteps(false);
  }
  
  /**
   * Function to go next a page from the current step
   */
  paginatorNext() {
    this.page++;
    this.changeMinMaxSteps(true);
  }
  
  /**
   * Function to go back from the current step
   */
  goBack() {
    if (this.step > 0) {
      this.step--;
      this.myStepper.previous();
      this.pageChangeLogic(false);
    }
  }
  
  /**
   * Function to go forward from the current step
   */
  goForward() {
    if (this.step < this.totalSteps - 1) {
      this.step++;
      this.myStepper.next();
      this.pageChangeLogic(true);
    }
  }
  
  /**
   * This will display the steps in DOM based on the min max step indexes allowed in view
   */
  private rerender() {
    const headers = this.elementRef.nativeElement.querySelectorAll(
      "mat-step-header"
    );

    const lines = this.elementRef.nativeElement.querySelectorAll(
      ".mat-stepper-horizontal-line"
    );

    // If the step index is in between min and max allowed indexes, display it into view, otherwise set as none
    for (let h of headers) {
      let str = h.getAttribute("ng-reflect-index");
      if (
        str !== null &&
        Number.parseInt(str) >= this.minStepAllowed &&
        Number.parseInt(str) <= this.maxStepAllowed
      ) {
        h.style.display = "flex";
      } else {
        h.style.display = "none";
      }
    }

    // If the line index is between min and max allowed indexes, display it in view, otherwise set as none
    // One thing to note here: length of lines is 1 less than length of headers
    // For eg, if there are 8 steps, there will be 7 lines joining those 8 steps
    for (let [index, l] of lines.entries()) {
      if (index >= this.minStepAllowed && index < this.maxStepAllowed) {
        l.style.display = "block";
      } else {
        l.style.display = "none";
      }
    }
  }

}
