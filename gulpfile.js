var fs = require("fs-extra");
var path = require("path");
var gulp = require("gulp");
var sass = require("gulp-sass");
var rename = require("gulp-rename");
var cleanCSS = require("gulp-clean-css");
var cssWrap = require("gulp-css-wrap");
var minimist = require("minimist");
var params = minimist(process.argv.slice(2), {
  string: "child",
  default: {
    child: "demo"
  }
});

// 生成外框架各种皮肤
gulp.task("css-wrap-black", function() {
  // return gulp.src(path.resolve('./theme/dist/h_ui.css'))/* 找需要添加命名空间的css文件，支持正则表达式 */
  return gulp
    .src(["./src/frame/styles/theme/black/main.scss"])
    .pipe(sass())
    .pipe(rename("hui-black.css"))
    .pipe(
      cssWrap({
        selector: ".black" /* 添加的命名空间 */
      })
    )
    .pipe(cleanCSS())
    .pipe(gulp.dest(path.resolve("./src/frame/my-theme-css"))); /* 存放的目录 */
});
gulp.task("css-wrap-lightblue", function() {
  return gulp
    .src(["./src/frame/styles/theme/lightblue/main.scss"])
    .pipe(sass())
    .pipe(rename("hui-lightblue.css"))
    .pipe(
      cssWrap({
        selector: ".lightblue" /* 添加的命名空间 */
      })
    )
    .pipe(cleanCSS())
    .pipe(gulp.dest(path.resolve("./src/frame/my-theme-css"))); /* 存放的目录 */
});
gulp.task("css-wrap-uf3", function() {
  return gulp
    .src(["./src/frame/styles/theme/uf3/main.scss"])
    .pipe(sass())
    .pipe(rename("hui-uf3.css"))
    .pipe(
      cssWrap({
        selector: ".uf3" /* 添加的命名空间 */
      })
    )
    .pipe(cleanCSS())
    .pipe(gulp.dest(path.resolve("./src/frame/my-theme-css"))); /* 存放的目录 */
});
// 拷贝字体(需先在./src/style中执行hui-theme init hui，保证有icon文件夹)
gulp.task("fonts", function() {
  return gulp.src("./src/frame/styles/hui/icon/iconfont.{eot,svg,ttf,woff}").pipe(gulp.dest(path.resolve("./src/frame/my-theme-css/icon"))); /* 存放的目录 */
});

//打包外框架
gulp.task("css-wrap-all", ["css-wrap-black", "css-wrap-lightblue", "css-wrap-uf3", "fonts"]);

/**
 * @description generate subsystem skin theme
 * @param child {string} --child=demo,test
 * @todo main.scss 为空时会报错
 */
gulp.task("css-wrap-child", () => {
  const p = [];
  if (params.child && params.child.split(",").length > 0) {
    const childs = params.child.split(",");
    for (const child of childs) {
      const meta = fs.readJsonSync(`./src/biz/${child}/meta.json`, { throws: false });
      for (const theme of ["black", "lightblue", "uf3"]) {
        p.push(
          new Promise(resolve => {
            gulp
              .src(["./src/biz/" + child + "/styles/theme/" + theme + "/main.scss"])
              .pipe(sass())
              .pipe(rename(`hui-child-${theme}.css`))
              .pipe(
                cssWrap({
                  selector: `.${theme}${meta && meta["style-isolate"] ? " :local" : ""}`
                })
              )
              .pipe(cleanCSS())
              .pipe(gulp.dest(path.resolve("./src/biz/" + child + "/my-theme-css")))
              .on("finish", resolve);
          })
        );
      }
      // 拷贝字体(需先在./src/style中执行hui-theme init hui，保证有icon文件夹)
      gulp.src("./src/frame/styles/hui/icon/iconfont.{eot,svg,ttf,woff}").pipe(gulp.dest(path.resolve("./src/biz/" + child + "/my-theme-css/icon")));
    }
  }

  return Promise.all(p);
});

/**
 * @description deploy watcher
 * @todo seperate different subsystem
 */

if (params.watch && params.child && params.child.split(",").length > 0) {
  const childs = params.child.split(",");
  for (const child of childs) {
    gulp.watch(["./src/biz/" + child + "/**/*.css", "./src/biz/" + child + "/**/*.less", "./src/biz/" + child + "/**/*.sass", "./src/biz/" + child + "/**/*.scss"], ["css-wrap-child"]);
  }
}
