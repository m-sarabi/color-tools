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

class KMeans {
    constructor(k, colors) {
        this.k = k;
        this.colors = colors;
        this.clusters = [];
        this.assignments = new Array(colors.length);
        this.converged = false;
        this.count = 0;
    }

    kMeansPlusPlus() {
        const n = this.colors.length;
        const distances = new Array(n).fill(Infinity);

        this.clusters.push(this.colors[Math.floor(Math.random() * n)]);

        for (let i = 1; i < this.k; i++) {
            let sum = 0;
            for (let j = 0; j < n; j++) {
                distances[j] = Math.min(distances[j], this.getDistance(this.colors[j], this.clusters[i - 1]));
                sum += distances[j];
            }

            let target = Math.random() * sum;
            for (let j = 0; j < n; j++) {
                target -= distances[j];
                if (target <= 0) {
                    this.clusters.push(this.colors[j]);
                    break;
                }
            }
        }
    }

    getDistance(color1, color2) {
        const r = color1[0] - color2[0];
        const g = color1[1] - color2[1];
        const b = color1[2] - color2[2];
        return Math.sqrt(r * r + g * g + b * b);
    }

    meanClusterColor(cluster) {
        const total = cluster.reduce((sum, color) => {
            return [
                sum[0] + color[0],
                sum[1] + color[1],
                sum[2] + color[2]
            ];
        }, [0, 0, 0]);
        return [
            Math.round(total[0] / cluster.length),
            Math.round(total[1] / cluster.length),
            Math.round(total[2] / cluster.length)
        ];
    }

    clusterPixels() {
        for (let i = 0; i < this.colors.length; i++) {
            let minDistance = Infinity;
            let closestCluster = -1;
            for (let j = 0; j < this.clusters.length; j++) {
                const distance = this.getDistance(this.colors[i], this.clusters[j]);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestCluster = j;
                }
            }
            this.assignments[i] = closestCluster;
        }
    }

    updateClusters() {
        const newClusters = Array.from({length: this.k}, () => []);
        for (let i = 0; i < this.colors.length; i++) {
            newClusters[this.assignments[i]].push(this.colors[i]);
        }

        this.converged = true;
        for (let i = 0; i < this.clusters.length; i++) {
            const meanColor = this.meanClusterColor(newClusters[i]);
            if (this.getDistance(this.clusters[i], meanColor) > 0) {
                this.converged = false;
                this.clusters[i] = meanColor;
            }
        }
    }

    run() {
        this.kMeansPlusPlus();
        while (!this.converged) {
            this.clusterPixels();
            this.updateClusters();
        }
    }

    getClusters() {
        this.run();
        const colorCounts = this.clusters.map(() => 0);
        for (let i = 0; i < this.colors.length; i++) {
            colorCounts[this.assignments[i]]++;
        }
        return this.clusters.map((color, index) => {
            return {
                'color': color,
                'count': colorCounts[index]
            };
        });
    }
}

const random = {
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    choice(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },
};