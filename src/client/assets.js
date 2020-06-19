import cards from '../../public/Deck_Sprite.png';
import cards2 from '../../public/Deck_Sprite.gif';
import felt from '../../public/tabletop.jpg';

const ASSET_NAMES = ['Deck_Sprite.png', 'Deck_Sprite.gif', 'tabletop.jpg'];
var assets = [];

export function loadAssets() {
    var img1 = new Image();
    img1.onload = () => {
        console.log(`downloading ${cards}`);
        assets[ASSET_NAMES[0]] = img1;
    }
    img1.src = `/${cards}`;

    var img2 = new Image();
    img2.onload = () => {
        console.log(`downloading ${cards2}`);
        assets[ASSET_NAMES[1]] = img2;
    }
    img2.src = `/${cards2}`;

    var img3 = new Image();
    img3.onload = () => {
        console.log(`downloading ${felt}`);
        assets[ASSET_NAMES[2]] = img3;
    }
    img3.src = `/${felt}`;
}

export function getAsset(assetName) {
    return assets[assetName];
}