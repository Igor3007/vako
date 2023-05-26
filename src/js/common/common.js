 document.addEventListener("DOMContentLoaded", function (event) {

     const API_YMAPS = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';


     /* =================================================
     load ymaps api
     =================================================*/

     window.loadApiYmaps = function (callback) {

         if (window.ymaps == undefined) {
             const script = document.createElement('script')
             script.src = API_YMAPS
             script.onload = () => {
                 callback(window.ymaps)
             }
             document.head.append(script)
         } else {
             callback(window.ymaps)
         }

     }

     /* =================================================
     preloader
     ================================================= */

     class Preloader {

         constructor() {
             this.$el = this.init()
             this.state = false
         }

         init() {
             const el = document.createElement('div')
             el.classList.add('loading')
             el.innerHTML = '<div class="indeterminate"></div>';
             document.body.append(el)
             return el;
         }

         load() {

             this.state = true;

             setTimeout(() => {
                 if (this.state) this.$el.classList.add('load')
             }, 300)
         }

         stop() {

             this.state = false;

             setTimeout(() => {
                 if (this.$el.classList.contains('load'))
                     this.$el.classList.remove('load')
             }, 200)
         }

     }

     window.preloader = new Preloader();



     /* ==============================================
     mobile menu
     ============================================== */

     function Status() {

         this.containerElem = '#status'
         this.headerElem = '#status_header'
         this.msgElem = '#status_msg'
         this.btnElem = '#status_btn'
         this.timeOut = 10000,
             this.autoHide = true

         this.init = function () {
             let elem = document.createElement('div')
             elem.setAttribute('id', 'status')
             elem.innerHTML = '<div id="status_header"></div> <div id="status_msg"></div><div id="status_btn"></div>'
             document.body.append(elem)

             document.querySelector(this.btnElem).addEventListener('click', function () {
                 this.parentNode.setAttribute('class', '')
             })
         }

         this.msg = function (_msg, _header) {
             _header = (_header ? _header : 'Успешно')
             this.onShow('complete', _header, _msg)
             if (this.autoHide) {
                 this.onHide();
             }
         }
         this.err = function (_msg, _header) {
             _header = (_header ? _header : 'Ошибка')
             this.onShow('error', _header, _msg)
             if (this.autoHide) {
                 this.onHide();
             }
         }
         this.wrn = function (_msg, _header) {
             _header = (_header ? _header : 'Внимание')
             this.onShow('warning', _header, _msg)
             if (this.autoHide) {
                 this.onHide();
             }
         }

         this.onShow = function (_type, _header, _msg) {
             document.querySelector(this.headerElem).innerText = _header
             document.querySelector(this.msgElem).innerText = _msg
             document.querySelector(this.containerElem).classList.add(_type)
         }

         this.onHide = function () {
             setTimeout(() => {
                 document.querySelector(this.containerElem).setAttribute('class', '')
             }, this.timeOut);
         }

     }

     window.STATUS = new Status();
     const STATUS = window.STATUS;
     STATUS.init();

     /******************************************** 
      * ajax request
      ********************************************/

     window.ajax = function (params, response) {

         //params Object
         //dom element
         //collback function

         window.preloader.load()

         let xhr = new XMLHttpRequest();
         xhr.open((params.type ? params.type : 'POST'), params.url)

         if (params.responseType == 'json') {
             xhr.responseType = 'json';
             xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
             xhr.send(JSON.stringify(params.data))
         } else {

             let formData = new FormData()

             for (key in params.data) {
                 formData.append(key, params.data[key])
             }

             xhr.send(formData)

         }

         xhr.onload = function () {

             response ? response(xhr.status, xhr.response) : ''

             window.preloader.stop()

             setTimeout(function () {
                 if (params.btn) {
                     params.btn.classList.remove('btn-loading')
                 }
             }, 300)
         };

         xhr.onerror = function () {
             window.STATUS.err('Error: ajax request failed')
         };

         xhr.onreadystatechange = function () {

             if (xhr.readyState == 3) {
                 if (params.btn) {
                     params.btn.classList.add('btn-loading')
                 }
             }

         };
     }

     /* ==============================================
     mobile menu
     ============================================== */

     if (document.querySelector('[data-menu="btn"]')) {
         const elContainer = document.querySelector('[data-menu="container"]')
         const elButton = document.querySelector('[data-menu="btn"]')

         function mobileMenu(params) {
             this.el = params.elContainer;
             this.button = params.elButton;
             this.state = 'close';

             this.open = function () {

                 if (window.userMenuInstance) {
                     window.userMenuInstance.close()
                 }


                 this.el.classList.add('open')
                 this.button.classList.add('open')
                 document.body.classList.add('hidden')
                 this.state = 'open';

             }

             this.close = function () {

                 this.el.classList.add('close-animate')
                 this.button.classList.remove('open')


                 setTimeout(() => {
                     this.el.classList.remove('open')
                     this.el.classList.remove('close-animate')
                     document.body.classList.remove('hidden')
                     this.state = 'close'
                 }, 200)


             }

             this.toggle = function () {
                 if (this.state == 'close') this.open()
                 else this.close()
             }
         }

         window.menuInstanse = new mobileMenu({
             elButton,
             elContainer
         })

         elButton.addEventListener('click', function () {
             window.menuInstanse.toggle()
         })
     }


     /* ==============================================
     select
     ============================================== */

     // public methods
     // select.afSelect.open()
     // select.afSelect.close()
     // select.afSelect.update()

     const selectCustom = new afSelect({
         selector: 'select'
     })

     selectCustom.init()


     /* =================================================
     scroll
     ================================================= */

     window.scrollToTargetAdjusted = function (elem) {

         //elem string selector

         if (!document.querySelector(elem)) return false;

         let element = document.querySelector(elem);
         let headerOffset = 0;
         let elementPosition = element.offsetTop
         let offsetPosition = elementPosition - headerOffset;

         var offset = element.getBoundingClientRect();

         window.scrollTo({
             top: offset.top,
             behavior: "smooth"
         });
     }

     /* ==================================================
     find 
     ==================================================*/

     window.getScrollBarWidth = function () {

         // Creating invisible container
         const outer = document.createElement('div');
         outer.style.visibility = 'hidden';
         outer.style.overflow = 'scroll'; // forcing scrollbar to appear
         outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
         document.body.appendChild(outer);

         // Creating inner element and placing it in the container
         const inner = document.createElement('div');
         outer.appendChild(inner);

         // Calculating difference between container's full width and the child width
         const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);

         // Removing temporary elements from the DOM
         outer.parentNode.removeChild(outer);

         return scrollbarWidth;

     }

     if (document.querySelector('.search-index__field input')) {


         class indexFind {
             constructor() {
                 this.$el = document.querySelector('[data-index-find="container"]')
                 this.input = this.$el.querySelector('[data-index-find="input"]')
                 this.form = this.$el.querySelector('[data-index-find="form"]')
                 this.suggest = this.$el.querySelector('[data-index-find="suggest"]')
                 this.closeButton = null;

                 this.events()
             }

             lockScroll(val) {
                 document.querySelector('html').style.overflow = (val ? 'hidden' : 'visible')
                 document.body.style.overflow = (val ? 'hidden' : 'visible')
                 if (document.body.clientWidth > 1200 && window.location.pathname != '/') {
                     document.body.style.marginRight = (val ? '0' : '0')
                 }
             }

             open() {
                 this.form.classList.add('is-focus')
                 this.createCloseButton()
                 this.lockScroll(true)

                 window.scrollTo(0, 0)

             }

             close() {
                 this.form.classList.remove('is-focus')
                 this.input.blur()
                 this.lockScroll(false)
                 if (this.closeButton) {
                     this.closeButton.remove()
                 }
             }

             createCloseButton() {
                 this.closeButton = document.createElement('span')
                 this.closeButton.classList.add('icon-cross')
                 this.closeButton.addEventListener('click', e => {
                     if (document.body.clientWidth < 767) {
                         this.close()
                     } else {
                         this.input.value = ''
                     }
                 })

                 if (!this.input.parentNode.querySelector('.icon-cross')) {
                     this.input.parentNode.append(this.closeButton)
                 }
             }

             getRecentRequest() {
                 return [
                     'galaxy s11',
                     'askhome norman',
                     'metta-su-bg-8',
                     'askhome sirius',
                     'gigabyte b560m',
                     'tetchair mesh-4hr',
                     'everprof polo',
                     'asus m5',
                 ]

             }

             render(response) {

                 this.suggest.querySelector('.find-suggest').innerHTML = '';

                 function suggestTemplate(data) {
                     const elem = document.createElement('li')
                     elem.innerHTML = `<a href="${data.href}">${data.text}</a>`;
                     return elem;
                 }

                 function productTemplate(data) {

                     const elem = document.createElement('div')
                     elem.classList.add('item-sugest')


                     const html = `<div class="item-sugest">
                                <div class="item-sugest__image">
                                    <picture><img src="${data.image}" alt=""></picture>
                                </div>
                                <div class="item-sugest__main">
                                    <div class="item-sugest__title"><a href="#">${data.title}</a></div>
                                    <div class="item-sugest__desc">${data.desc}</div>
                                </div>
                            </div>`;

                     elem.innerHTML = html

                     return elem
                 }

                 const suggestElement = document.createElement('div')
                 const suggestElementUl = document.createElement('ul')
                 suggestElement.classList.add('find-suggest__list')

                 response.suggest.forEach(item => {
                     suggestElementUl.append(suggestTemplate(item))
                 });

                 suggestElement.append(suggestElementUl)
                 this.suggest.querySelector('.find-suggest').append(suggestElement)

                 /* ================= */

                 const categoryElement = document.createElement('div')
                 categoryElement.classList.add('find-suggest__category')

                 response.category.forEach(item => {
                     categoryElement.append(productTemplate(item))
                 });

                 // console.log(categoryElement)

                 this.suggest.querySelector('.find-suggest').append(categoryElement)

                 /* ================= */

                 const categoryProduct = document.createElement('div')
                 categoryProduct.classList.add('find-suggest__product')

                 response.products.forEach(item => {
                     categoryProduct.append(productTemplate(item))
                 });

                 this.suggest.querySelector('.find-suggest').append(categoryProduct)

             }

             renderRecent() {

                 const recentList = this.getRecentRequest();
                 const elemUl = document.createElement('ul')
                 elemUl.classList.add('recent-list')

                 recentList.forEach(li => {

                     const elem = document.createElement('li')
                     elem.innerHTML = `<span>${li}</span>  <span class="icon-cross" ></span>`

                     elemUl.append(elem)
                 })

                 this.suggest.querySelector('.find-suggest').innerHTML = ''
                 this.suggest.querySelector('.find-suggest').append(elemUl)

             }

             ajaxRequest(e) {

                 let _this = this


                 window.ajax({
                     type: 'GET',
                     url: '/json/index-find.json',
                     responseType: 'json',
                     data: {
                         value: e.target.value
                     }
                 }, function (status, response) {
                     _this.render(response)
                 })
             }

             events() {

                 this.input.addEventListener('focus', e => {

                     this.open()

                     if (e.target.value.length) {
                         this.ajaxRequest(e)
                     } else {
                         this.renderRecent()
                     }

                 })

                 this.input.addEventListener('keyup', e => {

                     if (e.target.value.length) {
                         this.ajaxRequest(e)
                     } else {
                         this.renderRecent()
                     }


                 })

                 document.addEventListener('click', e => {

                     //console.log(e.target)

                     if (!e.target.closest('.search-index__field')) {

                         if (document.querySelector('.search-index__form.is-focus')) {
                             this.close()
                         }

                     }
                 })

             }


         }

         new indexFind();

     }

     /* =======================================
     btn btn-catalog
     =======================================*/

     if (document.querySelector('.btn-catalog')) {

         class catalogPopup {
             constructor() {
                 this.$el = document.querySelector('.catalog-popup')
                 this.btnCatalog = document.querySelector('.btn-catalog')
                 this.btnClose = this.$el.querySelector('[data-catalog-popup="close"]')
                 this.mobileBreakpoint = 993;
                 this.initWindowWidth = document.body.clientWidth

                 this.events()
             }

             open() {
                 this.$el.classList.add('open')
                 this.lockScroll(true)
                 const items = this.$el.querySelector('.catalog-popup__nav').querySelectorAll('li')
                 if (document.body.clientWidth > this.mobileBreakpoint && items.length) {
                     this.openSubDesctop(items[0])
                 }


             }

             close() {
                 this.$el.classList.remove('open')
                 this.lockScroll(false)
             }

             lockScroll(val) {
                 document.querySelector('html').style.overflow = (val ? 'hidden' : 'visible')
                 document.body.style.overflow = (val ? 'hidden' : 'visible')
                 if (document.body.clientWidth > 1200 && window.location.pathname != '/') {
                     document.body.style.marginRight = (val ? '0' : '0')
                 }


             }

             openSubMobile(item) {



                 if (item.querySelector('.sub-menu')) {

                     const template = `
                        <div class="catalog-popup__layer-title" >
                            <span class="icon-back" ></span>
                            <span class="layer-name" >${item.querySelector('a').innerText}</span>
                            <span class="icon-cross" ></span>
                        </div>
                        <div class="catalog-popup__layer-nav" ><ul>${item.querySelector('.sub-menu').innerHTML}</ul></div>
                       `;

                     const layer = document.createElement('div')
                     layer.classList.add('catalog-popup__layer')
                     layer.innerHTML = template

                     layer.querySelector('.icon-back').addEventListener('click', e => {
                         layer.remove()
                     })

                     layer.querySelector('.icon-cross').addEventListener('click', e => {
                         this.close()
                     })

                     this.liEvents(layer)

                     this.$el.querySelector('.catalog-popup__main').append(layer)

                 }

             }


             openSubDesctop(item) {

                 if (item.querySelector('.sub-menu')) {

                     item.classList.add('is-hover')

                     const template = `
                        <div class="catalog-popup__catig" >${item.querySelector('a').innerText}</div>
                        <div class="catalog-popup__list" ><ul>${item.querySelector('.sub-menu').innerHTML}</ul></div>
                       `;


                     const layer = document.createElement('div')
                     layer.classList.add('catalog-popup__submenu')
                     layer.innerHTML = template

                     const subMenu = layer.querySelectorAll('.sub-menu')

                     subMenu.forEach(item => {

                         if (item.querySelectorAll('li').length > 5) {

                             item.classList.add('is-slice-list')

                             const elem = document.createElement('div')
                             elem.classList.add('sub-menu-toggle')
                             elem.innerText = 'Ещё'

                             //add event

                             elem.addEventListener('click', e => {
                                 item.classList.toggle('is-open')
                                 elem.classList.toggle('is-open')
                                 elem.innerText = (item.classList.contains('is-open') ? 'Свернуть' : 'Ещё')
                             })

                             item.after(elem)

                         }

                     })

                     this.$el.querySelector('.catalog-popup__main').innerHTML = '';
                     this.$el.querySelector('.catalog-popup__main').append(layer)

                 }

             }

             events() {



                 this.btnCatalog.addEventListener('click', e => {
                     e.preventDefault()
                     this.open()
                 })

                 this.liEvents(this.$el.querySelector('.catalog-popup__nav'))



                 this.$el.addEventListener('click', e => {

                     //console.log(e.target)
                     if (document.body.clientWidth > this.mobileBreakpoint) {
                         if (!e.target.closest('.catalog-popup__wrp') && !e.target.closest('.btn-catalog')) {
                             this.close()
                         }
                     }
                 })


                 this.btnClose.addEventListener('click', e => {
                     this.close()
                 })

                 window.addEventListener('resize', e => this.close())


             }

             liEvents(container) {
                 const items = container.querySelectorAll('li')

                 items.forEach(item => {



                     item.addEventListener((document.body.clientWidth > this.mobileBreakpoint ? 'mouseenter' : 'click'), e => {

                         items.forEach(item => {
                             if (item.classList.contains('is-hover')) {
                                 item.classList.remove('is-hover')
                             }
                         })


                         if (document.body.clientWidth > this.mobileBreakpoint) {
                             this.openSubDesctop(item)
                         } else {
                             this.openSubMobile(e.target)
                         }

                     })
                 })
             }
         }

         new catalogPopup()

     }

     /* ====================================
     data-catalog="nav"
     ====================================*/

     if (document.querySelector('[data-catalog="nav"]')) {

         const container = document.querySelector('[data-catalog="nav"]')
         const subMenu = container.querySelectorAll('.sub-menu')

         subMenu.forEach(item => {

             if (item.querySelectorAll('li').length > 5) {

                 const elem = document.createElement('div')
                 elem.classList.add('sub-menu-toggle')
                 elem.innerText = 'Ещё'

                 //add event

                 elem.addEventListener('click', e => {
                     item.classList.toggle('is-open')
                     elem.classList.toggle('is-open')
                     elem.innerText = (item.classList.contains('is-open') ? 'Свернуть' : 'Ещё')
                 })

                 item.after(elem)

             }

         })

     }

     /* =======================================
     show all ctigory
     =======================================*/

     if (document.querySelector('[data-all-catid="show"]')) {
         document.querySelector('[data-all-catid="show"]').addEventListener('click', e => {
             e.target.classList.toggle('is-open')
             document.querySelector('[data-catalog="nav"]').classList.toggle('is-open')
         })
     }

     /*========================================
     select 
     ========================================*/


     if (document.querySelector('[data-popup="region"]')) {

         const selectRegionPopup = new afLightbox({
             mobileInBottom: false
         })

         const formElement = document.querySelector('[data-popup="select-region"]')

         document.querySelector('[data-popup="region"]').addEventListener('click', function (e) {
             e.preventDefault()

             selectRegionPopup.open(formElement.outerHTML, function (instanse) {
                 //selectCustom.reinit(instanse.querySelector('.af-popup select'))
             })

         })


     }

     /*======================================
      minicard slider
     ======================================*/

     if (document.querySelector('.minicard')) {
         const items = document.querySelectorAll('[data-slider="gallery"]')

         items.forEach(item => {
             const slider = new Splide(item, {
                 perPage: 1,
                 arrows: false
             })

             slider.mount()
         })

     }

     /* =========================================
     range slider
     =========================================*/

     function initPriceRange() {
         let newRangeSlider = new ZBRangeSlider('my-slider');

         let inputMax = document.querySelector('[data-price-range="max"]');
         let inputMin = document.querySelector('[data-price-range="min"]');

         let priceMax = newRangeSlider.slider.getAttribute('se-max')
         let priceMin = newRangeSlider.slider.getAttribute('se-min')

         newRangeSlider.onChange = function (min, max) {
             inputMax.value = max
             inputMin.value = min

             inputMin.closest('form').submit()

         }

         inputMax.addEventListener('keyup', e => {
             let int = e.target.value.replace(/[^\+\d]/g, '');


             if (Number(int) >= Number(priceMax)) {
                 int = priceMax
             }
             e.target.value = int
             newRangeSlider.setMaxValue(int)
         })

         inputMin.addEventListener('keyup', e => {
             let int = e.target.value.replace(/[^\+\d]/g, '');

             if (int >= 0) {
                 e.target.value = int
                 newRangeSlider.setMinValue(int)
             }
         })


     }

     if (document.querySelector('#my-slider')) {
         initPriceRange()
     }

     /* ===========================================
     change view catalog
     ===========================================*/

     if (document.querySelector('[data-view="list"]')) {

         const btnList = document.querySelector('[data-view="list"]')
         const btnGrid = document.querySelector('[data-view="grid"]')
         const catalog = document.querySelector('[data-catalog="container"]')

         if (btnList) {
             btnList.addEventListener('click', e => {

                 btnList.classList.add('is-active')
                 if (btnGrid.classList.contains('is-active')) {
                     btnGrid.classList.remove('is-active')
                 }

                 if (catalog.classList.contains('grid--view')) {
                     catalog.classList.remove('grid--view')
                 }
             })
         }

         if (btnGrid) {
             btnGrid.addEventListener('click', e => {
                 catalog.classList.add('grid--view')

                 btnGrid.classList.add('is-active')
                 if (btnList.classList.contains('is-active')) {
                     btnList.classList.remove('is-active')
                 }
             })
         }

     }

     /* ==========================================
     map point pvz
     ==========================================*/

     if (document.querySelector('[data-shop-points]')) {

         class PoinstPopup {
             constructor(elem) {
                 this.$el = elem.querySelector('.popup-shop-points')
                 this.init();
                 this.map = false;
             }

             init() {
                 this.$el.innerHTML = this.getTemplateMain()
                 this.initMap()

             }

             initMap() {
                 window.loadApiYmaps((e) => {

                     ymaps.ready(() => {
                         this.map = new ymaps.Map('map', {
                             center: [55.76, 37.64], // Москва
                             zoom: 10,
                             controls: ['zoomControl', 'fullscreenControl']
                         }, {
                             suppressMapOpenBlock: true
                         });

                         this.getJsonData()
                     });


                 })
             }

             getJsonData() {
                 window.ajax({
                     type: 'GET',
                     url: '/json/points.json',
                     responseType: 'json',
                     data: {
                         value: 123
                     }
                 }, (status, response) => {
                     this.render(response)
                 })
             }

             getTemplateMain() {
                 return `
                    <div class="popup-points" >
                        <div class="popup-points__head" >Пункты выдачи магазина PCPlanet.ru</div>
                        <div class="popup-points__wrp" >
                            <div class="popup-points__map" ><div id="map" ></div></div>
                            <div class="popup-points__list" >
                                <div class="popup-points__stores" ></div>
                                <div class="popup-points__items" >
                                    <ul data-poits="list" ></ul>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
             }

             getTemplateItem(item) {
                 return `

                <div class="popup-points__item" >
                    <div class="popup-points__title" >${item.title}</div>
                    <div class="popup-points__worktime" >${item.worktime}</div>
                    <div class="popup-points__now" >${item.now}</div>
                </div>

                `;
             }

             scrollToItem(index) {

                 const container = this.$el.querySelector('.popup-points__items')
                 const items = this.$el.querySelectorAll('.popup-points__item')
                 const elem = items[index];

                 var rect = elem.getBoundingClientRect();
                 var rectContainer = container.getBoundingClientRect();

                 let elemOffset = {
                     top: rect.top + document.body.scrollTop,
                     left: rect.left + document.body.scrollLeft
                 }

                 let containerOffset = {
                     top: rectContainer.top + document.body.scrollTop,
                     left: rectContainer.left + document.body.scrollLeft
                 }

                 let TopPX = elemOffset.top - containerOffset.top + container.scrollTop - (container.offsetHeight / 2) + (elem.offsetHeight / 2)

                 container.scrollTo({
                     top: TopPX,
                     behavior: 'smooth'
                 });

                 this.setActive(index)
             }

             createPlacemark(item, index) {
                 let point = new window.ymaps.GeoObject({
                     geometry: {
                         type: "Point",
                         coordinates: item.coordinates.split(',')
                     },
                     properties: {
                         //iconContent: 'Метка',
                         //balloonHeader: item.title,
                         //balloonContent: item.title
                     }
                 }, {
                     preset: 'islands#blueCircleDotIcon',
                 })

                 point.events.add('click', () => {
                     this.scrollToItem(index)
                 })

                 return point;
             }

             setActive(index) {

                 const items = this.$el.querySelectorAll('.popup-points__item')

                 items.forEach(i => {
                     if (i.classList.contains('is-active')) {
                         i.classList.remove('is-active')
                     }
                 })

                 items[index].classList.add('is-active')
             }

             render(response) {

                 function word(number, txt) {
                     var cases = [2, 0, 1, 1, 1, 2];
                     return txt[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
                 }

                 this.$el.querySelector('.popup-points__stores').innerHTML = response.length + ' ' + word(response.length, ['магазин', 'магазина', 'магазинов'])

                 response.forEach((item, index) => {

                     let elem = document.createElement('div')
                     elem.innerHTML = this.getTemplateItem(item)

                     elem.querySelector('.popup-points__item').addEventListener('click', e => {

                         this.setActive(index)

                         this.map.setCenter(item.coordinates.split(','), 16, {
                             checkZoomRange: true
                         });
                     })

                     this.$el.querySelector('[data-poits="list"]').append(elem.lastElementChild)


                     let placemark = this.createPlacemark(item, index)
                     this.map.geoObjects.add(placemark)

                 })

                 this.map.setBounds(this.map.geoObjects.getBounds(), {
                     checkZoomRange: true,
                     zoomMargin: 50
                 });
             }
         }

         const pointPopup = new afLightbox({
             mobileInBottom: true
         })

         const items = document.querySelectorAll('[data-shop-points]')

         items.forEach(item => {
             item.addEventListener('click', e => {

                 pointPopup.open('<div class="popup-shop-points" ></div>', function (instanse) {

                     new PoinstPopup(instanse)

                 })


             })
         })


     }

     /* =========================================
     show / hide item filter
     =========================================*/

     if (document.querySelector('.filter-properties__head')) {
         const items = document.querySelectorAll('.filter-properties__head')

         items.forEach(item => {
             item.addEventListener('click', e => {
                 item.closest('.filter-properties').classList.toggle('is-hide')
             })
         })
     }

     /* =======================================
     open filter
     ======================================= */

     if (document.querySelector('[data-filter="open"]')) {

         const items = document.querySelectorAll('[data-filter="open"]')

         items.forEach(item => {
             item.addEventListener('click', e => {


                 if (document.querySelector('[data-filter-container="' + item.dataset.elem + '"]')) {
                     document.querySelector('[data-filter-container="' + item.dataset.elem + '"]').classList.toggle('is-open')
                 }

                 setTimeout(() => {
                     initPriceRange()
                     document.body.classList.toggle('page-hidden')
                 }, 50)



             })
         })


     }



     /* =======================================
     click sort dropdown
     =======================================*/

     if (document.querySelector('.sort-dropdown')) {
         const items = document.querySelectorAll('.sort-dropdown')

         items.forEach(item => {
             item.addEventListener('click', e => {
                 item.classList.toggle('is-active')

                 document.addEventListener('click', e => {
                     if (item.classList.contains('is-active') && !e.target.closest('.sort-dropdown')) item.classList.toggle('is-active')
                 })

             })


         })
     }

     /* ========================================
     popup number for mobile
     ========================================*/

     if (document.querySelector('[data-popup="number"]')) {
         const items = document.querySelectorAll('[data-popup="number"]')

         items.forEach(item => {
             item.addEventListener('click', e => {

                 window.ajax({
                     type: 'GET',
                     url: '/json/phones.json',
                     responseType: 'json',
                     data: {
                         value: e.target.dataset.store
                     }
                 }, function (status, response) {

                     let numbers = new String();

                     response.phones.forEach(num => {
                         numbers += '<li><a href="tel:' + num.replace(/[^\+\d]/g, '') + '" >' + num + '</a></li>'
                     })


                     if (document.body.clientWidth <= 480) {
                         const callPopup = new afLightbox({
                             mobileInBottom: true
                         })

                         const html = `
                          <div class="popup-call-number" >
                              <h2>${response.store}</h2>
                              <ul>${numbers}</ul>
                          </div>`

                         callPopup.open(html, function (instanse) {})

                     } else {
                         item.classList.toggle('is-active')
                         item.querySelector('[data-numbers="store"]').innerHTML = numbers

                         function closeNumber() {
                             if (item.classList.contains('is-active')) item.classList.remove('is-active')
                         }

                         document.addEventListener('click', closeNumber)
                         document.addEventListener('scroll', closeNumber)
                     }

                 })




             })
         })
     }

     /* ====================================
     show-hide properties filter
     ====================================*/

     if (document.querySelector('.filter-properties')) {

         const container = document.querySelector('.category-filter')
         const subMenu = container.querySelectorAll('.filter-properties__list ul')

         // console.log(subMenu)

         subMenu.forEach(item => {

             if (item.querySelectorAll('li').length > 8) {

                 const elem = document.createElement('div')
                 elem.classList.add('sub-menu-toggle')
                 elem.innerText = 'Ещё'

                 //add event

                 elem.addEventListener('click', e => {
                     item.classList.toggle('is-open')
                     elem.classList.toggle('is-open')
                     elem.innerText = (item.classList.contains('is-open') ? 'Свернуть' : 'Ещё')
                 })

                 item.after(elem)

             }

         })

     }

     /* ====================================
     clear filter
     ====================================*/

     if (document.querySelector('[data-filter="clear"]')) {

         const items = document.querySelectorAll('[data-filter="clear"]')

         items.forEach(item => {
             item.addEventListener('click', e => {
                 e.target.closest('form').reset()
             })
         })


     }

     /* ====================================
     send filter
     ====================================*/

     if (document.querySelector('[data-filter="submit"]')) {
         document.querySelector('[data-filter="submit"]').addEventListener('click', e => {
             window.preloader.load()



             setTimeout(() => {
                 window.preloader.stop()
                 if (document.querySelector('.category-filter').classList.contains('is-open')) {
                     document.querySelector('.category-filter').classList.remove('is-open')
                     document.body.classList.contains('page-hidden') ? document.body.classList.remove('page-hidden') : ''
                 }
             }, 1000)
         })
     }

     if (document.querySelector('[data-filter="clear"]')) {
         document.querySelector('[data-filter="clear"]').addEventListener('click', e => {
             e.target.closest('form').reset()
         })

         //=========

         document.querySelector('.category-filter__wrp form').addEventListener('submit', e => {
             e.preventDefault()
         })
     }


     window.addEventListener('resize', () => {
         // We execute the same script as before
         let vh = window.innerHeight * 0.01;
         document.documentElement.style.setProperty('--vh', `${vh}px`);
     });


     /* ======================================
     slider sigle product
     ======================================*/

     if (document.querySelector('[data-slider="product"]')) {

         let main = new Splide('[data-slider="product"]', {
             type: 'fade',
             pagination: false,
             arrows: false,
             cover: true,

             breakpoints: {
                 640: {
                     pagination: true,
                     type: 'fade',
                 },
             },
         });

         let thumbnails = new Splide('[data-slider="thumb"]', {
             rewind: true,
             perPage: 4,
             arrows: false,
             isNavigation: true,
             gap: 10,
             focus: 'center',
             pagination: false,
             cover: true,
             updateOnMove: true,
             dragMinThreshold: {
                 mouse: 4,
                 touch: 10,
             },
             //  breakpoints: {
             //      640: {
             //          fixedWidth: 70,
             //          fixedHeight: 70,
             //      },
             //  },
         });

         main.sync(thumbnails);
         main.mount();
         thumbnails.mount();

     }

     /* =====================================
     tabs single product
     =====================================*/


     class Tabs {

         constructor(params) {
             this.setting = params
             this.nav = document.querySelector(this.setting.navElem)

             if (this.nav) {
                 this.container = document.querySelector(this.setting.containerElem)
                 this.items = this.container.querySelectorAll('[data-tab]')
                 this.init()
             }

         }


         init() {

             if (this.checkHash()) {
                 this.changeTab(this.checkHash(), {
                     scroll: false
                 })
             } else {
                 this.changeTab(this.setting.tabStart, {
                     scroll: false
                 })
             }

             this.clickTab()


         }

         checkHash() {
             if (window.location.hash == '') return false;
             return window.location.hash.replace('#', '')
         }

         scrollToElem(elem, container) {
             var rect = elem.getBoundingClientRect();
             var rectContainer = container.getBoundingClientRect();

             let elemOffset = {
                 top: rect.top + document.body.scrollTop,
                 left: rect.left + document.body.scrollLeft
             }

             let containerOffset = {
                 top: rectContainer.top + document.body.scrollTop,
                 left: rectContainer.left + document.body.scrollLeft
             }

             let leftPX = elemOffset.left - containerOffset.left + container.scrollLeft - (container.offsetWidth / 2) + (elem.offsetWidth / 2) + 5

             container.scrollTo({
                 left: leftPX,
                 behavior: 'smooth'
             });
         }

         changeTab(tab, params) {


             // this.items[0].classList.add('active')

             this.items.forEach(item => {

                 if (item.dataset.tab.split(',').indexOf(tab) !== -1) {

                     this.items.forEach(item => {

                         if (item.dataset.tab.split(',').indexOf(tab) !== -1) {
                             item.classList.add('active')

                         } else {
                             if (item.classList.contains('active')) {
                                 item.classList.remove('active')
                             }
                         }

                     })

                 }

             })

             if (this.nav.querySelector('[href="#' + tab + '"]')) {

                 //select active tab
                 this.nav.querySelectorAll('a').forEach((item) => {
                     if (item.getAttribute('href') == '#' + tab) {
                         item.parentNode.classList.add('active')
                         this.scrollToElem(item.parentNode, this.nav)
                     } else {
                         if (item.parentNode.classList.contains('active')) {
                             item.parentNode.classList.remove('active')
                         }
                     }
                 })

                 //scroll to elem

                 if (params.scroll) {
                     window.scrollTo({
                         top: (document.querySelector('header').clientHeight || 0),
                         behavior: 'smooth'

                     })
                 }
             }

             this.setting.onChangeTab(tab)

             initPriceRange()

         }

         clickTab() {

             var _this = this;

             //  this.nav.querySelectorAll('a').forEach(function (item) {
             //      item.addEventListener('click', function (event) {
             //          _this.changeTab((this.getAttribute('href').replace('#', '')))
             //      })
             //  })

             window.addEventListener('hashchange', function () {
                 _this.changeTab(window.location.hash.replace('#', ''), {
                     scroll: true
                 })
             });
         }


     }


     window.tabsSingleProduct = new Tabs({
         navElem: '[data-tab-nav="product"]',
         containerElem: '[data-tab-container="product"]',
         tabStart: 'common',

         onChangeTab: function (tab) {
             //console.log('info', tab)
         }
     })



     /* ======================================
     fixed nav single product
     ======================================*/

     if (document.querySelector('.single-product__tabs')) {

         const elemTabs = document.querySelector('.single-product__tabs')
         const topOffset = elemTabs.getBoundingClientRect().top + document.body.scrollTop
         const heihgtTabs = (topOffset - elemTabs.clientHeight)

         window.addEventListener('scroll', () => {



             if (window.pageYOffset > heihgtTabs) {
                 document.querySelector('.single-product__tabs').classList.add('fixed-tabs')
             } else {
                 if (document.querySelector('.single-product__tabs').classList.contains('fixed-tabs')) {
                     document.querySelector('.single-product__tabs').classList.remove('fixed-tabs')
                 }
             }
         })

     }



     /* =================================
     store offers
     =================================*/

     if (document.querySelector('[data-popup="more-offers"]')) {

         const buttons = document.querySelectorAll('[data-popup="more-offers"]')

         const popupStoreOffers = new afLightbox({
             mobileInBottom: true
         })

         function getTemplateModal(response, name) {

             const html = document.createElement('div')
             html.classList.add('popup-store-offers')
             html.innerHTML = `
                <div class="popup-store-offers__title" >Другие предложения магазина ${name}</div>
                <div class="popup-store-offers__items" >
                    <div class="popup-store-offers__wrp" >${response}</div>
                </div>
            `
             return html.outerHTML;

         }

         buttons.forEach(function (button) {
             button.addEventListener('click', e => {
                 window.ajax({
                     type: 'GET',
                     url: '/_store-offers.html',
                     responseType: 'html',
                     data: {
                         value: e.target.value
                     }
                 }, (status, response) => {
                     popupStoreOffers.open(getTemplateModal(response, button.dataset.storeName), function (instanse) {
                         // after open
                     })
                 })
             })
         })

     }


     /* ====================================
     ajax tooltip
     ====================================*/

     if (document.querySelector('[data-prop-tooltip]')) {


         class TooltipAjax {

             constructor() {
                 this.$items = document.querySelectorAll('[data-prop-tooltip]')
                 this.addEvents()
                 this.tooltip = null;
             }

             ajaxLoadTooltip(e, callback) {

                 window.ajax({
                     type: 'GET', //POST
                     url: '/json/tooltips.json',
                     responseType: 'json',
                     data: {
                         idProduct: e.target.dataset.id,
                         idTooltip: e.target.dataset.propTooltip
                     }
                 }, function (status, response) {
                     callback(response)
                 })

             }

             getTemplate(data) {



                 let html = ` <div class="tooltip-box" ><div class="af-spiner" ></div></div> `;

                 if (data) {

                     html = `<div class="tooltip-box" >
                                <div class="tooltip-box__title" >${data.title}</div>
                                <div class="tooltip-box__text" >${data.text}</div>
                            </div> `;
                 }

                 return html;

             }

             positionTooltip(e) {
                 const DomRect = e.target.getBoundingClientRect()
                 const tooltipW = this.tooltip.clientWidth;
                 const tooltipH = this.tooltip.clientHeight;
                 const offset = 20;

                 this.tooltip.style.left = (DomRect.x - (tooltipW / 2) + (offset / 2)) + 'px'
                 this.tooltip.style.top = (DomRect.y - tooltipH - (offset / 2)) + 'px'


                 if (this.tooltip.getBoundingClientRect().left < offset) {
                     this.tooltip.classList.add('tooltip-box-item--left')
                     this.tooltip.style.left = (DomRect.x - (DomRect.x / 2) + (offset / 2)) + 'px'
                 }

                 if (this.tooltip.getBoundingClientRect().top < offset) {
                     this.tooltip.classList.add('tooltip-box-item--top')
                     this.tooltip.style.top = (DomRect.y + (offset)) + 'px'
                 }
             }

             tooltipDesctop(e) {

                 this.tooltipRemove()

                 this.tooltip = document.createElement('div')
                 this.tooltip.innerHTML = this.getTemplate(false)
                 this.tooltip.classList.add('tooltip-box-item')

                 e.target.append(this.tooltip)
                 this.positionTooltip(e)

                 //load data

                 this.ajaxLoadTooltip(e, (response) => {
                     this.tooltip.innerHTML = this.getTemplate(response)
                     this.positionTooltip(e)

                 })


             }

             tooltipPopup(e) {
                 const tooltipPopup = new afLightbox({
                     mobileInBottom: true
                 })

                 tooltipPopup.open('<div class="popup-tooltip-box" >' + this.getTemplate(false) + '</div>', () => {

                     this.ajaxLoadTooltip(e, (response) => {
                         tooltipPopup.changeContent('<div class="popup-tooltip-box" >' + this.getTemplate(response) + '</div>')
                     })

                 })
             }

             tooltipRemove() {
                 this.tooltip ? this.tooltip.remove() : ''
             }

             addEvents() {
                 this.$items.forEach(item => {

                     //for desctop
                     if (document.body.clientWidth > 992) {
                         item.addEventListener('mouseenter', e => {
                             this.tooltipDesctop(e)
                         })
                         item.addEventListener('mouseleave', e => {
                             this.tooltipRemove()
                         })
                     }

                     //for mobile

                     item.addEventListener('click', e => {
                         this.tooltipPopup(e)
                     })


                 })
             }

         }

         new TooltipAjax()






     }

     /* ====================================
      change tab catalog
      ====================================*/

     if (document.querySelector('[data-single-view]')) {

         const items = document.querySelectorAll('[data-single-view]')
         const tabs = document.querySelectorAll('[data-single-catalog]')

         items.forEach(item => {
             item.addEventListener('click', e => {

                 tabs.forEach(tab => {
                     if (tab.dataset.singleCatalog == item.dataset.singleView) {
                         tab.classList.add('is-active')
                     } else {
                         if (tab.classList.contains('is-active')) {
                             tab.classList.remove('is-active')
                         }
                     }
                 })

             })
         })

         /* ======================== */

         window.loadApiYmaps((e) => {

             ymaps.ready(() => {

                 var map;

                 map = new ymaps.Map('map-stores', {
                     center: [55.76, 37.64], // Москва
                     zoom: 10,
                     controls: ['zoomControl', 'fullscreenControl']
                 }, {
                     suppressMapOpenBlock: true
                 });

                 //this.getJsonData()
             });


         })

     }


     /* ====================================
      class revies
      ====================================*/

     class Reviews {
         constructor(params) {
             this.$el = document.querySelector(params.container)

             if (this.$el) {

                 this.addSelector = '[data-review="add"]';
                 this.showSelector = '[data-review="show-comment"]';
                 this.loadSelector = '[data-review="load"]';
                 this.LikeSelector = '[data-like="add"]';

                 this.buttonsAddComment = this.$el.querySelectorAll(this.addSelector);
                 this.buttonsShowComment = this.$el.querySelectorAll(this.showSelector);
                 this.buttonsLoadComment = this.$el.querySelectorAll(this.loadSelector);
                 this.buttonsLikeComment = this.$el.querySelectorAll(this.LikeSelector);

                 this.ListComments = this.$el.querySelector('[data-review="list"]');
                 this.addEvents();
                 this.formInstanse = null;
             }

         }

         getTemplateForm() {
             const html = `
                <form>
                    <div class="review-form" >
                        <div class="review-form__textarea" >
                            <textarea name="comment" placeholder="Введите..." ></textarea>
                        </div>
                        <div class="review-form__send" >
                            <button class="btn btn-small" type="submit" >Отправить</button>
                        </div>
                    </div>
                </form>
            `;

             return html;
         }

         addForm(e) {
             const parent = e.target.closest('.card-review__main')

             if (this.formInstanse) {
                 this.formInstanse.remove()
             }

             this.formInstanse = document.createElement('div')
             this.formInstanse.classList.add('card-review__form')
             this.formInstanse.innerHTML = this.getTemplateForm()

             this.sendComment(this.formInstanse.querySelector('form'), e)

             parent.querySelector('.card-review__action').after(this.formInstanse)
         }

         sendComment(form, eventClick) {

             form.addEventListener('submit', e => {
                 e.preventDefault()

                 const formData = new FormData(form)
                 const button = eventClick.target.closest('[data-review]')

                 if (!formData.get('comment')) {
                     window.STATUS.wrn('Нельзя отправить пустой комментарий')
                     return false;
                 }

                 window.ajax({
                     type: 'POST', //POST
                     url: '/_comment-reply.html',
                     responseType: 'html',
                     data: {
                         id: button.dataset.id || 0,
                         parentId: button.dataset.parent || 0
                     }
                 }, (status, response) => {
                     window.STATUS.msg('Комментарий добавлен!', '')

                     this.renderReply(e, response)

                 })


             })

         }

         renderReply(e, response) {
             const main = e.target.closest('.card-review__main');

             const htmlComment = document.createElement('div')
             htmlComment.innerHTML = response

             this.updateEvent(htmlComment)

             //если нету дочерних 
             if (!main.querySelector('.card-review__childs')) {

                 this.formInstanse.closest('.card-review').after(htmlComment.lastChild)

             } else {
                 main.querySelector('.card-review__childs').classList.add('is-open')
                 main.querySelector('.card-review__childs').append(htmlComment.lastChild)

             }

             //удалить форму
             if (this.formInstanse) {
                 this.formInstanse.remove()
             }

         }

         showHideChilds(e) {
             const itemComment = e.target.closest('.card-review')

             itemComment.querySelector('.card-review__childs').classList.toggle('is-open')
         }

         renderLoadComments(response) {

             const LoadComments = document.createElement('div')
             LoadComments.innerHTML = response

             LoadComments.querySelectorAll('.comment > .card-review').forEach(item => {

                 this.updateEvent(item)

                 const newComment = document.createElement('div')
                 newComment.classList.add('review-content__item')
                 newComment.append(item)

                 this.ListComments.append(newComment)

             })
         }

         loadMore(e) {
             window.ajax({
                 type: 'GET', //POST
                 url: '/_comment-more.html',
                 responseType: 'html',
                 data: {
                     id: e.target.dataset.id,
                 }
             }, (status, response) => {
                 window.STATUS.msg('Комментарий load!', '')

                 this.renderLoadComments(response)

             })
         }

         changeLike(e) {
             let item = e.target.closest('[data-like]')
             let num = item.querySelector('.like-count')

             item.classList.toggle('is-active')

             if (item.classList.contains('is-active')) {
                 num.innerText = (Number(item.querySelector('.like-count').innerText) + 1)
             } else {
                 num.innerText = (Number(item.querySelector('.like-count').innerText) - 1)
             }

             window.ajax({
                 type: 'GET', //POST
                 url: '/json/tooltips.json',
                 responseType: 'json',
                 data: {
                     id: item.dataset.id,
                 }
             }, false)
         }

         updateEvent(comment) {
             comment.querySelectorAll(this.addSelector).forEach(item => {
                 item.addEventListener('click', e => {
                     this.addForm(e)
                 })
             })

             comment.querySelectorAll(this.showSelector).forEach(item => {
                 item.addEventListener('click', e => {
                     this.showHideChilds(e)
                 })
             })

             comment.querySelectorAll(this.loadSelector).forEach(item => {
                 item.addEventListener('click', e => {
                     this.loadMore(e)
                 })
             })
             comment.querySelectorAll(this.LikeSelector).forEach(item => {
                 item.addEventListener('click', e => {
                     this.changeLike(e)
                 })
             })
         }



         addEvents() {
             this.buttonsAddComment.forEach(item => {
                 item.addEventListener('click', e => {
                     this.addForm(e)
                 })
             })

             this.buttonsShowComment.forEach(item => {
                 item.addEventListener('click', e => {
                     this.showHideChilds(e)
                 })
             })

             this.buttonsLoadComment.forEach(item => {
                 item.addEventListener('click', e => {
                     this.loadMore(e)
                 })
             })

             this.buttonsLikeComment.forEach(item => {
                 item.addEventListener('click', e => {
                     this.changeLike(e)
                 })
             })


         }


     }

     new Reviews({
         container: '.review-content'
     });

     /* ==============================================
     view all photo
    ============================================== */

     if (document.querySelector('.product-images__all')) {

         document.querySelector('.product-images__all').addEventListener('click', e => {

             const img = document.querySelectorAll('.product-images__thumb img')
             const arrImage = [];

             img.forEach(image => {
                 arrImage.push(image.getAttribute('src'))
             })

             const instance = new FsLightbox();
             instance.props.type = "image";
             instance.props.sources = arrImage;
             instance.open()


         })

     }

     /* =========================================
     create review
     =========================================*/

     if (document.querySelector('[data-review="create"]')) {

         const items = document.querySelectorAll('[data-review="create"]')
         const createReviewPopup = new afLightbox({
             mobileInBottom: true
         })
         const successPopup = new afLightbox({
             mobileInBottom: false
         })


         items.forEach(item => {
             item.addEventListener('click', e => {

                 createReviewPopup.open('<div class="af-spiner" ></div>', function (instanse) {
                     window.ajax({
                         type: 'GET', //POST
                         url: '/_popup-create-review.html',
                         responseType: 'html',

                     }, (status, response) => {


                         instanse.querySelector('.af-popup__content').innerHTML = response

                         const form = instanse.querySelector('form')

                         form.addEventListener('submit', e => {

                             e.preventDefault()

                             window.ajax({
                                 type: 'GET', //POST
                                 url: '/_popup-succes-review.html',
                                 responseType: 'html',

                             }, (status, response) => {

                                 successPopup.open(response, (popup) => {
                                     createReviewPopup.close()
                                     popup.querySelector('[data-popup="close"]').addEventListener('click', e => successPopup.close())

                                 })

                             })


                         })



                     })
                 })

             })
         })

     }

     /* ========================================
     show more
     ========================================*/

     if (document.querySelector('.product-prop__desc')) {

         const text = document.querySelector('.product-prop__desc')

         if (text.innerText.length > 300 && document.body.clientWidth <= 480) {

             // create button
             const showButton = document.createElement('div')
             showButton.classList.add('product-prop__show')
             showButton.classList.add('sub-menu-toggle')
             showButton.innerHTML = 'Читать полностью'

             showButton.addEventListener('click', e => {
                 text.classList.toggle('is-open')
                 showButton.classList.toggle('is-open')
                 showButton.innerText = (text.classList.contains('is-open') ? 'Свернуть' : 'Читать полностью')
             })

             text.classList.add('text--line-clamp-6')
             text.after(showButton)

         }



     }













 });