"use strict";

import gulp from "gulp";

const requireDir = require("require-dir"),
    paths = {
        views: {
            src: [
                "./src/views/index.pug",
                "./src/views/pages/*.pug"
            ],
            dist: "./dist/",
            watch: [
                "./src/blocks/**/*.pug",
                "./src/data/**/*.pug",
                "./src/views/**/*.pug",
                "./src/blocks/**/*.js",
            ]
        },
        styles: {
            src: [
                "./src/styles/main.{scss,sass}",
                "./src/styles/site.{scss,sass}",
                "./src/styles/critical.{scss,sass}",
            ],
            dist: "./dist/styles/",
            watch: [
                "./src/blocks/**/*.{scss,sass}",
                "./src/styles/**/*.{scss,sass}"
            ]
        },
        scripts: {
            src: "./src/js/",
            dist: "./dist/js/",
            watch: [
                "./src/blocks/**/*.js",
                "./src/js/**/*.js"
            ]
        },
        vendor: {
            watch: [
                "./src/blocks/**/*.js",
                "./src/js/**/*.js"
            ]
        },
        common: {
            watch: [
                "./src/js/**/*.js"
            ]
        },
        images: {
            src: [
                "./src/img/**/*.{jpg,jpeg,png,gif,tiff,svg}",
                "!./src/img/favicon/*.{jpg,jpeg,png,gif,tiff}"
            ],
            dist: "./dist/img/",
            watch: "./src/img/**/*.{jpg,jpeg,png,gif,svg}"
        },
        webp: {
            src: [
                "./src/img/**/*.{jpg,jpeg,png,tiff}",
                "!./src/img/favicon/*.{jpg,jpeg,png,gif}"
            ],
            dist: "./dist/img/",
            watch: [
                "./src/img/**/*.{jpg,jpeg,png,tiff}",
                "!./src/img/favicon.{jpg,jpeg,png,gif}"
            ]
        },
        sprites: {
            src: "./src/img/svg/*.svg",
            dist: "./dist/img/sprites/",
            watch: "./src/img/svg/*.svg"
        },
        fonts: {
            src: "./src/fonts/**/*.{woff,woff2}",
            dist: "./dist/fonts/",
            watch: "./src/fonts/**/*.{woff,woff2}"
        },
        favicons: {
            src: "./src/img/favicon/*.{jpg,jpeg,png,gif,tiff}",
            dist: "./dist/img/favicons/",
        },
        libs: {
            src: "./src/js/lib/*.{js,json}",
            dist: "./dist/js/lib/",
            watch: [
                "./src/blocks/**/*.{js,json}",
                "./src/js/**/*.js"
            ]
        },
        gzip: {
            src: "./src/.htaccess",
            dist: "./dist/"
        }
    };

requireDir("./gulp-tasks/");

export {
    paths
};

export const development = gulp.series("clean", "smart-grid", "styles",
    gulp.parallel(["views", "vendor", "common", "images", "webp", "libs", "sprites", "fonts", "favicons"]),
    gulp.parallel("serve"));

export const prod = gulp.series("clean",
    gulp.series(["styles", "views", "vendor", "common", "images", "webp", "sprites", "libs", "fonts", "favicons", "gzip"]));

export default development;