// les joueurs
function joueur() {
    this.pseudoName = "";
    this.bonnesLettresJoueur = 0;
    this.mauvaisesLettresJoueur = 0;
    this.tempsJoueur = 0;
}
// tableau top dix
const topDix = []
if(localStorage['TOPDIX'] === undefined){
    for (let index = 0; index < 10; index++) {
        topDix[index] = new joueur();
    }
} else {
    for (let index = 0; index < 10; index++) {
        topDix[index] = JSON.parse(localStorage['TOPDIX'])[index];
    }
}


// début du jeu
var bonnesLettresTempJoueur;
var mauvaisesLettresTempJoueur;
var debut;
var fin;
var temps;

// les balises html
const mot = $('#mot');
const mauvaisesLettres = $('#mauvaises-lettres');
const btnRejouer = $('#btn-rejouer');
const messageFinal = $('#message-final-container');
const notification = $('#notification-container');
const message = $('#message');
const themesTable = $('.all-themes');
const bonhommeParts = $('.bonhomme-part');
const btnTopDix = $('.btn-meilleurs-joueurs-container button');
const lifeSpan = $('.life');
const themesJSON = [ecoleJSON, paysagesClimatJSON, calculMesuresJSON, alimentsJSON, gestesMouvementsJSON];
const themes = themesJSON.map(JSON.parse);

// remplir la table des themes
themesTable.html(`
    ${themes.map(oneTheme => `<tr><td class="oneTheme">${oneTheme.intitule}</td></tr>`)}
    `);

const tabBonneLettres = [];
const tabMauvaisesLettres = [];

var selection;
var themeSelectione;
var motSelectionne;
var description;

function addClickOnTd() {
    jQuery.each($('.oneTheme'), (index, maClasse) => {
        $(maClasse).on('click', function() {
            tabBonneLettres.splice(0);
            tabMauvaisesLettres.splice(0);
            themeSelectione = themes[index];
            maSelection()
            console.log(motSelectionne);
            updateMauvaisesLettres();
            afficherMot();
        })
    });
}

function maSelection() {
    selection = themeSelectione.theme[Math.floor(Math.random() * themeSelectione.theme.length)];
    motSelectionne = selection.mot;
    description = selection.description;
}

// fonction pour afficher le motSelectionne:
function afficherMot() {
    mot.html(
        `${motSelectionne
            .split('')
            .map(
                lettre => `<span class="lettre">${tabBonneLettres.includes(lettre) ? lettre : ''}</span>`
            ).join('')}`
    );
    //console.log(mot.text());
    $('#description').text(description)
    if(mot.text() === motSelectionne){
        message.text("Bravo ! Vous avez trouvé le mot !");
        if(!($('.message-final p').is(':empty')))
            $('.message-final p').remove();
        btnRejouer.text("Continuer");
        messageFinal.css({"display":"flex"});
        $(window).off('keydown');
    }
}

// update mauvaises lettres:
function updateMauvaisesLettres() {
    // affichage des mauvaises lettres
    if(tabMauvaisesLettres.length != 0){
        $('.mauvaises-lettres-container p').text("Mauvaises lettres");
    } else{
        $('.mauvaises-lettres-container p').text("");
    }
    mauvaisesLettres.html(`
        ${tabMauvaisesLettres.map(lettre => `<span>${lettre}</span>`)}
    `);
    // affichage du bonhomme
    jQuery.each(bonhommeParts, (index, part) => {
        const nbrErrors = tabMauvaisesLettres.length;
        if(index < nbrErrors){
            part.style.display = 'block';

        } else {
            part.style.display= 'none';
        }
    })
    jQuery.each(lifeSpan, (index, life) => {
        const nbrErrors = tabMauvaisesLettres.length;
        if(index < nbrErrors){
            life.style.display = 'none';
        }
    })
    // tester game over
    if(tabMauvaisesLettres.length === bonhommeParts.length){
        fin = Date.now();
        temps = fin - debut;
        if(!($('.message-final p').is(':empty')))
            $('.message-final p').remove();
        message.text("Vous avez perdu cette partie !");
        message.append($('<p>').html(`Bonnes lettres: ${bonnesLettresTempJoueur}     Mauvaises Lettres: ${mauvaisesLettresTempJoueur}`));
        btnRejouer.text("Comparer mes résultats");
        messageFinal.css({"display":"flex"});
        $(window).off('keydown');
    }
}

// afficher la notification:
function afficherNotification() {
    notification.addClass("afficher");
    setTimeout(()=>{
        notification.removeClass("afficher");
    }, 1500);
}

// eventListener
function activateKeys() {
    $(window).keydown(e => {
        if(typeof motSelectionne !== "undefined"){
            
            // les keyCode des lettres varient entre 65=>a et 90=>z. keyCod = 65 et key = a.
            if((e.keyCode >= 65 && e.keyCode <= 90) || e.keyCode == 55 || e.keyCode == 50 || e.keyCode == 48 || e.keyCode == 57){
                const lettre = e.key;
                if(motSelectionne.includes(lettre)){
                    if(!tabBonneLettres.includes(lettre)){
                        tabBonneLettres.push(lettre);
                        bonnesLettresTempJoueur++;
                        afficherMot();
                    } else {
                        afficherNotification();
                    }
                } else {
                    if(!tabMauvaisesLettres.includes(lettre)){
                        tabMauvaisesLettres.push(lettre);
                        mauvaisesLettresTempJoueur++;
                        updateMauvaisesLettres();
                    } else {
                        afficherNotification();
                    }
                }
            }
        }
    });
}

btnRejouer.click(e => {
    if(btnRejouer.text()==="Continuer"){
        tabBonneLettres.splice(0);
        tabMauvaisesLettres.splice(0);

        maSelection()

        $(window).on('keydown', activateKeys());
        updateMauvaisesLettres();
        afficherMot();
        messageFinal.css({"display":"none"});
        afficherLife();
    }
    if(btnRejouer.text()==="Rejouer"){
        tabBonneLettres.splice(0);
        tabMauvaisesLettres.splice(0);
        initiate();
        maSelection();

        $(window).on('keydown', activateKeys());
        updateMauvaisesLettres();
        afficherMot();
        messageFinal.css({"display":"none"});
        afficherLife();
    }
    if(btnRejouer.text() === "Comparer mes résultats"){
        if(isTopDix()){
            message.text("Vous êtes top 10 !");
            //messageFinal.remove(btnRejouer);
            //$('.message-final').append($('<p>').html(`Saisissez votre nom: <input id="pseudo" type="text"/>`));
            $('<p>').html(`Saisissez votre nom: <input id="pseudo" type="text"/>`).insertBefore(btnRejouer);
            btnRejouer.text("Valider");
            return;
        }
        else {
            message.text("Malheuresement, vous n'êtes pas top 10 !");
            btnRejouer.text("Rejouer");
        }
    }
    if(btnRejouer.text() === "Valider"){
        topDix[9].pseudoName = $('#pseudo').val();
        topDix[9].bonnesLettresJoueur = bonnesLettresTempJoueur;
        topDix[9].mauvaisesLettresJoueur = mauvaisesLettresTempJoueur;
        topDix[9].tempsJoueur = temps;
        sortTopDix();
        localStorage['TOPDIX'] = JSON.stringify(topDix);
        initiate();
        tabBonneLettres.splice(0);
        tabMauvaisesLettres.splice(0);

        maSelection()

        $(window).on('keydown', activateKeys());
        updateMauvaisesLettres();
        afficherMot();
        messageFinal.css({"display":"none"});
        afficherLife();
    }
})

btnTopDix.click(e => {
    $('#table-topdix-container').css("display", "flex");
    remplirTableTopDix();
})

$('#OK-btn').click(e => {
    $('#table-topdix-container').css("display", "none");
})
function sortTopDix() {
    topDix.sort((a,b) => {
        if(a.bonnesLettresJoueur < b.bonnesLettresJoueur)
            return 1;
        if(a.bonnesLettresJoueur > b.bonnesLettresJoueur)
            return -1;
        if(a.mauvaisesLettresJoueur < b.mauvaisesLettresJoueur)
            return -1;
        if(a.mauvaisesLettresJoueur > b.mauvaisesLettresJoueur)
            return 1;
        if(a.tempsJoueur < b.tempsJoueur)
            return -1;
        if(a.tempsJoueur > b.tempsJoueur)
            return 1;
    })
}

function initiate() {
    bonnesLettresTempJoueur = 0;
    mauvaisesLettresTempJoueur = 0;
    debut = Date.now();
}

function isTopDix() {
    return (
        (bonnesLettresTempJoueur > topDix[9].bonnesLettresJoueur) ||
        (bonnesLettresTempJoueur === topDix[9].bonnesLettresJoueur && mauvaisesLettresTempJoueur < topDix[9].mauvaisesLettresJoueur)||
        (bonnesLettresTempJoueur === topDix[9].bonnesLettresJoueur && mauvaisesLettresTempJoueur === topDix[9].mauvaisesLettresJoueur && temps < topDix[9].tempsJoueur)
    );
}

// table des top dix
function remplirTableTopDix() {
    if($('.table-topdix tbody') !== null){
        $('.table-topdix tbody tr').remove();
    }
    if(localStorage['TOPDIX'] !== undefined){
        JSON.parse(localStorage['TOPDIX']).map((obj, index) => {
            if(obj.pseudoName !== ""){
                $('.table-topdix tbody').append($('<tr>').append($('<td>').html(`${index+1}`))
                    .append($('<td>').html(`${obj.pseudoName}`))
                    .append($('<td>').html(`${obj.bonnesLettresJoueur}`))
                    .append($('<td>').html(`${obj.mauvaisesLettresJoueur}`))
                    .append($('<td>').html(`${millisToMinutesAndSeconds(obj.tempsJoueur)}`))
                )
            }  
        })
    }
    
}

function afficherLife(){
    jQuery.each(lifeSpan, (index, life) => {
            life.style.display = 'inline';
    })
}
function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
  }

function startGame() {
    initiate();
    addClickOnTd();
    activateKeys();
}

startGame();
