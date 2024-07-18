class Color {
    constructor(r, g = null, b = null) {
        if (g === null && b === null) {
            this._extractColor(r);
        } else {
            this.r = r;
            this.g = g;
            this.b = b;
        }
    }

    _extractColor(color) {
        if (color.startsWith('#')) {
            this.r = parseInt(color.slice(1, 3), 16);
            this.g = parseInt(color.slice(3, 5), 16);
            this.b = parseInt(color.slice(5, 7), 16);
        } else if (color.startsWith('rgb')) {
            const rgb = color.slice(4, -1).split(',');
            this.r = parseInt(rgb[0]);
            this.g = parseInt(rgb[1]);
            this.b = parseInt(rgb[2]);
        }
    }

    rgb() {
        return `rgb(${this.r}, ${this.g}, ${this.b})`;
    }

    hex() {
        const zeroPad = (num) => num.toString(16).padStart(2, '0');
        return `#${zeroPad(this.r)}${zeroPad(this.g)}${zeroPad(this.b)}`;
    }
}
