document.addEventListener('DOMContentLoaded', () => {

    const slider1 = document.querySelector(".slide-track");
    const slidesstyles = document.querySelectorAll(".slide-track .slide");

    const productLists = document.querySelector('.Productlists');
    let isDragging = false;
    let startX;
    let scrollLeft;

    productLists.addEventListener('mousedown', (e) => {
        isDragging = true;
        productLists.classList.add('active');
        startX = e.pageX - productLists.offsetLeft;
        scrollLeft = productLists.scrollLeft;
        e.preventDefault();
    });

    productLists.addEventListener('mouseleave', () => {
        isDragging = false;
    });

    productLists.addEventListener('mouseup', () => {
        isDragging = false;
    });

    productLists.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - productLists.offsetLeft;
        const walk = (x - startX) * 2; // Scrolling speed
        productLists.scrollLeft = scrollLeft - walk;
    });

    manageAnimation2Block(slider1)
});

function manageAnimation2Block(slider1){
    const slider2 = document.querySelector(".slide-track2")

    const imagesUrl = [
        "/Images/populargamesimages/War Thunder.png",
        "/Images/populargamesimages/Corekeeper.jpg",
        "/Images/populargamesimages/Satisfactory.png",
        "/Images/populargamesimages/Monsterhunter.png",
        "/Images/populargamesimages/Valheim.png",
        "/Images/populargamesimages/Farmingsim.png",
        "/Images/populargamesimages/Factorio.png",
        "/Images/populargamesimages/companyofheroes.png"
    ]; 

    imagesUrl.forEach(image => {
        const slide = document.createElement("div");
        slide.classList.add("slide");

        const img = document.createElement("img");
        img.src = image;
        img.alt = "Game Image";

        slide.appendChild(img);
        slider1.appendChild(slide);
    }); 

    imagesUrl
    .slice()           // copy the array
    .reverse()         // flip it
    .forEach(image => {
      const slide = document.createElement("div");
      slide.classList.add("slide");

      const img = document.createElement("img");
      img.src = image;
      img.alt = "Game Image";

      slide.appendChild(img);
      slider2.appendChild(slide);
    });
}

function moveFirstImageToEnd() {
    //Detektieren, ob das erste Element im Slider den Viewport vollständig verlassen hat

    //Das erste Element im Slider zwischenspeichern

    //Das erste Element im Slider löschen

    //Das zwischengespeicherte Element am Ende vom Slider hinzufügen
}

function generateNewestGamesBlock1(){

}