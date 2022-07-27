import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-parcelle-detail',
  templateUrl: './parcelle-detail.component.html',
  styleUrls: ['./parcelle-detail.component.scss']
})
export class ParcelleDetailComponent implements OnInit {

  idParcelle : string = "";

  constructor(
    private route: ActivatedRoute,
    ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.idParcelle = params['idOfparcelleSelected'];
      console.log("id parcelle : "+this.idParcelle)
    });
  }

}
