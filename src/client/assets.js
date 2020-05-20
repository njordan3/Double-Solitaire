import cards from '../../public/Deck_Sprite.png';

const ASSET_NAMES = ['Deck_Sprite.png'];
var assets = [];

export function loadAssets() {
    var img1 = new Image();
    img1.onload = () => {
        console.log(`downloading ${cards}`);
        assets[ASSET_NAMES[0]] = img1;
    }
    img1.src = `/${cards}`;
}

export function getAsset(assetName) {
    return assets[assetName];
}