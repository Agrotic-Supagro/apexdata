import { ThisReceiver } from "@angular/compiler";

export class Session{

    //DB received data
    id_session : string;
    date_creation : string;
    date_maj : string;
    nom_parcelle : string;
    moyLat : number;
    moyLong : number;
    apex0 : number;
    apex1 : number;
    apex2 : number;

    //Computed Data
    moyenne: number= 0;
    tauxApex0: number= 0;
    tauxApex1: number= 0;
    tauxApex2: number = 0;
    apexValues: number[] = [];
    ifvClasse : number = 0;
    ic_apex : string = "";
    
    public constructor(id_session : string, date_creation: string, date_maj: string, nom_parcelle : string, moyLat : number, moyLong : number,
        apex0 : string, apex1 : string, apex2 : string){
        this.id_session = id_session;
        this.date_creation = this.transform(date_creation, 'dates');
        this.date_maj = this.transform(date_maj, 'dates');
        this.nom_parcelle = nom_parcelle;
        this.moyLat = moyLat;
        this.moyLong = moyLong;
        this.apex0 = parseInt(apex0);
        this.apex1 = parseInt(apex1);
        this.apex2 = parseInt(apex2);
        this.computeSessionData();
    }

    computeSessionData(){
        this.moyenne = ((this.apex0) + (this.apex1 / 2)) / (this.apex0 + this.apex1 + this.apex2);
        this.ic_apex = this.moyenne.toFixed(2);
        this.tauxApex0 = (this.apex0 / (this.apex2 + this.apex0 + this.apex1)) * 100;
        this.tauxApex1 = (this.apex1 / (this.apex2 + this.apex0 + this.apex1)) * 100;
        this.tauxApex2 = (this.apex2 / (this.apex2 + this.apex0 + this.apex1))* 100;
        this.apexValues = [Math.round(this.tauxApex0), Math.round(this.tauxApex1), Math.round(this.tauxApex2)];
        // GESTION DES CLASSES DE CONTRAINTE HYDRIQUE ET ECIMAGE
        // Classe IFV : 0 = absente, 1 = moderee, 2 = importante, 3 = forte, 4 = ecimee
        if (this.apex0 === 999) {
            this.ifvClasse = 4;
        } 
        else {
            // GESTION DES CLASSES
            if (this.moyenne >= 0.75) {
                this.ifvClasse = 0;
            } 
            else {
                if (this.tauxApex0 >= 5) {
                    this.ifvClasse = 1;
                } 
                else {
                    if (this.tauxApex2 <= 90) {
                        this.ifvClasse = 2;
                    }
                }
            }
        }
    }

    transform(value: string, arg : string): any {
        if (arg === 'dates') {
          var arr1 = value.split(' ');
          var arr2 = arr1[0].split('-');
          return arr2[2] + '/' + arr2[1] + '/' + arr2[0];
        }
        else if (arg === 'heures') {
          var arr1 = value.split(' ');
          var arr2 = arr1[1].split(':');
          return arr2[0] + ':' + arr2[1];
        }
        return value;
      }
}