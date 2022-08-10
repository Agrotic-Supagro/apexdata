
export class Session{

    //DB received data
    id_session : string;
    id_parcelle : string;
    date_session : string;
    date_maj : string;
    nom_parcelle : string;
    moyLat : number;
    moyLong : number;
    apex0 : number;
    apex1 : number;
    apex2 : number;
    oldSessionapex0: number| undefined;
    oldSessionapex1 : number | undefined;
    oldSessionapex2 : number| undefined;
    dynamique : number = 2;

    //Computed Data
    moyenne: number= 0;
    tauxApex0: number= 0;
    tauxApex1: number= 0;
    tauxApex2: number = 0;
    apexValues: number[] = [];
    ifvClasse : number = 0;
    ic_apex : string = "";
    
    public constructor(id_session : string, id_parcelle : string, date_session: string, date_maj: string, nom_parcelle : string, moyLat : string, moyLong : string,
        apex0 : string, apex1 : string, apex2 : string){
        this.id_session = id_session;
        this.id_parcelle = id_parcelle;
        this.date_session = this.transform(date_session, 'dates');
        this.date_maj = this.transform(date_maj, 'dates');
        this.nom_parcelle = nom_parcelle;
        this.moyLat = parseFloat(moyLat);
        this.moyLong = parseFloat(moyLong);
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

    setOldSessionValues(oldapex0 : number, oldapex1 : number, oldapex2 : number){
        this.oldSessionapex0 = oldapex0; 
        this.oldSessionapex1 = oldapex1;
        this.oldSessionapex2 = oldapex2;
        this.computeDynamique();
    }

    private computeDynamique(){
        // GESTION DYNAMIQUE CROISSANCE
        // dynamique : 0 = stable, 1 = croissance, -1 = decroissance, neutre =2
        this.dynamique = 0;
        const moyenneOld = ((this.oldSessionapex0!) + (this.oldSessionapex1! / 2)) / (this.oldSessionapex0! + this.oldSessionapex1! + this.oldSessionapex2!);
        const diffMoyenne = moyenneOld - this.moyenne;
        if (diffMoyenne > 0.2) {
            this.dynamique = -1;
        } 
        else {
            if (diffMoyenne < -0.2) {
            this.dynamique = 1;
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