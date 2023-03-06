 document.addEventListener("DOMContentLoaded", function (event) {

     const API_YMAPS = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';

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

         let xhr = new XMLHttpRequest();
         xhr.open((params.type ? params.type : 'POST'), params.url)

         if (params.responseType == 'json') {
             xhr.responseType = 'json';
             xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
         }

         xhr.send(JSON.stringify(params.data))

         xhr.onload = function () {
             response(xhr.status, xhr.response)
         };

         xhr.onerror = function () {
             window.STATUS.err('Error: ajax request failed')
         };

         xhr.onreadystatechange = function () {

             if (xhr.readyState == 3 && params.btn) {
                 params.btn.classList.add('btn-loading')
             }

             if (xhr.readyState == 4 && params.btn) {
                 setTimeout(function () {
                     params.btn.classList.remove('btn-loading')
                 }, 300)
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

     var newRangeSlider = new ZBRangeSlider('my-slider');

     newRangeSlider.onChange = function (min, max) {
         console.log(min, max, this);
         //document.getElementById('result').innerHTML = 'Min: ' + min + ' Max: ' + max;

         document.querySelector('[data-price-range="max"]').value = max
         document.querySelector('[data-price-range="min"]').value = min
     }

     newRangeSlider.didChanged = function (min, max) {
         console.log(min, max, this);
         //document.getElementById('result').innerHTML = 'Min: ' + min + ' Max: ' + max;
     }

     /* ===========================================
     change view catalog
     ===========================================*/

     if (document.querySelector('[data-view="list"]')) {

         const btnList = document.querySelector('[data-view="list"]')
         const btnGrid = document.querySelector('[data-view="grid"]')
         const catalog = document.querySelector('[data-catalog="container"]')

         btnList.addEventListener('click', e => {

             btnList.classList.add('is-active')
             if (btnGrid.classList.contains('is-active')) {
                 btnGrid.classList.remove('is-active')
             }

             if (catalog.classList.contains('grid--view')) {
                 catalog.classList.remove('grid--view')
             }
         })

         btnGrid.addEventListener('click', e => {
             catalog.classList.add('grid--view')

             btnGrid.classList.add('is-active')
             if (btnList.classList.contains('is-active')) {
                 btnList.classList.remove('is-active')
             }
         })

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
                 const scrollContainer = this.$el.querySelector('.popup-points__items')
                 const items = this.$el.querySelectorAll('.popup-points__item')

                 scrollContainer.scrollTo({
                     top: items[index].offsetTop,
                     behavior: 'smooth'
                 })

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





 });