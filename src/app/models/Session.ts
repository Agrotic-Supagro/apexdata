import { ThisReceiver } from "@angular/compiler";

export class Session{

    //DB received data
    id_session : string;
    date_creation : Date;
    date_maj : Date;
    nom_parcelle : string;
    moyLat : number;
    moyLong : number;
    apex0 : number;
    apex1 : number;
    apex2 : number;

    //Computed Data
    moyenne!: number;
    tauxApex0!: number;
    tauxApex1!: number;
    tauxApex2!: number;
    apexValues: number[] = [];
    ifvClasse! : number;
    ic_apex! : string;
    
    public constructor(id_session : string, date_creation: Date, date_maj: Date, nom_parcelle : string, moyLat : number, moyLong : number,
        apex0 : number, apex1 : number, apex2 : number){
        this.id_session = id_session;
        this.date_creation = date_creation;
        this.date_maj = date_maj;
        this.nom_parcelle = nom_parcelle;
        this.moyLat = moyLat;
        this.moyLong = moyLong;
        this.apex0 = apex0;
        this.apex1 = apex1;
        this.apex2 = apex2;
        this.computeSessionData();
    }

    computeSessionData(){
        this.moyenne = ((this.apex0) + (this.apex1 / 2)) / (this.apex0 + this.apex1 + this.apex2);
        this.ic_apex = this.moyenne.toFixed(2);
        this.tauxApex0 = this.apex0 / (this.apex2 + this.apex0 + this.apex1) * 100;
        this.tauxApex1 = this.apex1 / (this.apex2 + this.apex0 + this.apex1) * 100;
        this.tauxApex2 = this.apex2 / (this.apex2 + this.apex0 + this.apex1) * 100;
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
}