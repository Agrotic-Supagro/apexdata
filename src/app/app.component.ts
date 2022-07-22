import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ApeX Territoires';

  constructor(
    private _translate: TranslateService,
  ) {
  }

  ngOnInit(){
    this._translateLanguage();
  }

  _translateLanguage(): void {
    this._translate.use("fr");
  }
}
