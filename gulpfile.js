let project_folder = "dist";
let source_folder = "#src";

let fs = require('fs');

let path = {
	build: {
		html: project_folder + "/",
		csslib: project_folder + "/css/lib/",
		cssdef: project_folder + "/css/default/",
		csspage: project_folder + "/css/pages/",
		jslib: project_folder + "/js/lib/",
		jsdef: project_folder + "/js/default/",
		jspage: project_folder + "/js/pages/",
		img: project_folder + "/img/",
		fonts: project_folder + "/fonts/",
	},
	src: {
		html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
		csslib: source_folder + "/scss/lib/*.scss",
		cssdef: [source_folder + "/scss/default/*.scss", "!" + source_folder + "/scss/default/_*.scss"],
		csspage: [source_folder + "/scss/pages/*.scss", "!" + source_folder + "/scss/pages/_*.scss"],
		jslib: source_folder + "/js/lib/*.js",
		jsdef: [source_folder + "/js/default/*.js", "!" + source_folder + "/js/pages/_*.js"],
		jspage: [source_folder + "/js/pages/*.js", "!" + source_folder + "/js/pages/_*.js"],
		img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
		fonts: source_folder + "/fonts/*.{ttf,eot,otf}",
	},
	watch: {
		html: source_folder + "/**/*.html",
		csslib: source_folder + "/scss/lib/**/*.scss",
		cssdef: source_folder + "/scss/default/**/*.scss",
		csspage: source_folder + "/scss/pages/**/*.scss",
		jslib: source_folder + "/js/lib/**/*.js",
		jsdef: source_folder + "/js/default/**/*.js",
		jspage: source_folder + "/js/pages/**/*.js",
		img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
	},
	clean: "./" + project_folder + "/"
}

let { src, dest } = require('gulp'),
	gulp = require('gulp'),
	browsersync = require('browser-sync').create(),
	fileinclude = require('gulp-file-include'),
	del = require('del'),
	scss = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	group_media = require('gulp-group-css-media-queries'),
	clean_css = require('gulp-clean-css'),
	rename = require('gulp-rename'),
	uglify = require('gulp-uglify-es').default,
	imagemin = require('gulp-imagemin'),
	webp = require('gulp-webp'),
	webphtml = require('gulp-webp-html'),
	webpcss = require('gulp-webpcss'),
	svgSprite = require('gulp-svg-sprite'),
	ttf2woff = require('gulp-ttf2woff'),
	ttf2woff2 = require('gulp-ttf2woff2'),
	fonter = require('gulp-fonter');


function browserSync(params) {
	browsersync.init({
		server: {
			baseDir: "./" + project_folder + "/"
		},
		port: 3000,
		notify: false
	})
}

function html() {
	return src(path.src.html)
		.pipe(fileinclude())
		.pipe(webphtml())
		.pipe(dest(path.build.html))
		.pipe(browsersync.stream())
}

function images() {
	return src(path.src.img)
		.pipe(
			webp({
				quality: 70
			})
		)
		.pipe(dest(path.build.img))
		.pipe(src(path.src.img))
		.pipe(
			imagemin({
				progressive: true,
				svgoPlugins: [{ removeViewBox: false }],
				interlaced: true,
				optimizationLevel: 3
			})
		)
		.pipe(dest(path.build.img))
		.pipe(browsersync.stream())
}

function fonts() {
	src(path.src.fonts)
		.pipe(ttf2woff())
		.pipe(dest(path.build.fonts));
	return src(path.src.fonts)
		.pipe(ttf2woff2())
		.pipe(dest(path.build.fonts));
}

gulp.task('otf2ttf', function () {
	return src([source_folder + '/fonts/*.otf'])
		.pipe(fonter({
			formats: ['ttf']
		}))
		.pipe(dest(source_folder + '/fonts/'));
})

gulp.task('svgSprite', function () {
	return gulp.src([source_folder + '/iconsprite/*.svg'])
		.pipe(
			svgSprite({
				mode: {
					stack: {
						sprite: "../icons/icons.svg",
						example: true
					}
				}
			})
		)
		.pipe(dest(path.build.img))
})

function fontsStyle(params) {

	let file_content = fs.readFileSync(source_folder + '/scss/default/_fonts.scss');
	if (file_content == '') {
		fs.writeFile(source_folder + '/scss/default/fonts.scss', '', cb);
		return fs.readdir(path.build.fonts, function (err, items) {
			if (items) {
				let c_fontname;
				for (var i = 0; i < items.length; i++) {
					let fontname = items[i].split('.');
					fontname = fontname[0];
					if (c_fontname != fontname) {
						fs.appendFile(source_folder + '/scss/default/_fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
					}
					c_fontname = fontname;
				}
			}
		})
	}
}

function cb() { }


function watchFiles(params) {
	gulp.watch([path.watch.html], html);
	gulp.watch([path.watch.csslib], csslib);
	gulp.watch([path.watch.cssdef], cssdef);
	gulp.watch([path.watch.csspage], csspage);
	gulp.watch([path.watch.jslib], jslib);
	gulp.watch([path.watch.jsdef], jsdef);
	gulp.watch([path.watch.jspage], jspage);
	gulp.watch([path.watch.img], images);
}

function clean(params) {
	return del(path.clean);
}
function csslib() {
	return src(path.src.csslib)
		.pipe(
			scss({
				outputStyle: "expanded"
			})
		)
		.pipe(
			group_media()
		)
		.pipe(
			autoprefixer({
				overrideBrowserslist: ["last 30 versions"],
				cascade: true
			})
		)
		.pipe(webpcss())
		.pipe(dest(path.build.csslib))
		.pipe(clean_css())
		.pipe(rename({
			extname: ".min.css"
		}))
		.pipe(dest(path.build.csslib))
		.pipe(browsersync.stream())
}
function cssdef() {
	return src(path.src.cssdef)
		.pipe(
			scss({
				outputStyle: "expanded"
			})
		)
		.pipe(
			group_media()
		)
		.pipe(
			autoprefixer({
				overrideBrowserslist: ["last 30 versions"],
				cascade: true
			})
		)
		.pipe(webpcss())
		.pipe(dest(path.build.cssdef))
		.pipe(clean_css())
		.pipe(rename({
			extname: ".min.css"
		}))
		.pipe(dest(path.build.cssdef))
		.pipe(browsersync.stream())
}
function csspage() {
	return src(path.src.csspage)
		.pipe(
			scss({
				outputStyle: "expanded"
			})
		)
		.pipe(
			group_media()
		)
		.pipe(
			autoprefixer({
				overrideBrowserslist: ["last 30 versions"],
				cascade: true
			})
		)
		.pipe(webpcss())
		.pipe(dest(path.build.csspage))
		.pipe(clean_css())
		.pipe(rename({
			extname: ".min.css"
		}))
		.pipe(dest(path.build.csspage))
		.pipe(browsersync.stream())
}

function jslib() {
	return src(path.src.jslib)
		.pipe(fileinclude())
		.pipe(dest(path.build.jslib))
		.pipe(
			uglify()
		)
		.pipe(rename({
			extname: ".min.js"
		}))
		.pipe(dest(path.build.jslib))
		.pipe(browsersync.stream())
}
function jsdef() {
	return src(path.src.jsdef)
		.pipe(fileinclude())
		.pipe(dest(path.build.jsdef))
		.pipe(
			uglify()
		)
		.pipe(rename({
			extname: ".min.js"
		}))
		.pipe(dest(path.build.jsdef))
		.pipe(browsersync.stream())
}
function jspage() {
	return src(path.src.jspage)
		.pipe(fileinclude())
		.pipe(dest(path.build.jspage))
		.pipe(
			uglify()
		)
		.pipe(rename({
			extname: ".min.js"
		}))
		.pipe(dest(path.build.jspage))
		.pipe(browsersync.stream())
}


let build = gulp.series(clean, gulp.parallel(jslib, jsdef, jspage, csslib, cssdef, csspage, html, images, fonts), fontsStyle);
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.fontsStyle = fontsStyle;
exports.fonts = fonts;
exports.images = images;
exports.jslib = jslib;
exports.jsdef = jsdef;
exports.jspage = jspage;
exports.csslib = csslib;
exports.cssdef = cssdef;
exports.csspage = csspage;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;










