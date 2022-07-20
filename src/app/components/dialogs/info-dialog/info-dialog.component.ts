import { Component, Inject, OnInit } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-info-dialog',
  templateUrl: './info-dialog.component.html',
  styleUrls: ['./info-dialog.component.scss']
})
export class InfoDialogComponent implements OnInit {

  title = "";
  text = "";
  btn = "";


  constructor(@Inject(MAT_DIALOG_DATA) public data: {title : string, text: string, btn : string}) { }

  ngOnInit(): void {
    this.title = this.data.title;
    this.text = this.data.text;
    this.btn = this.data.btn;
  }

}
