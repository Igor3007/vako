document.addEventListener("DOMContentLoaded", function (event) {

    const API_YMAPS = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';
    window.isIOS = /iPad|iPhone|iPod/.test(navigator.platform) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)


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

    /* ==========================================
    mask
    ==========================================*/

    const {
        MaskInput,
    } = Maska

    function initMask() {
        new MaskInput("input[type='tel']", {
            mask: '+7 (###) ###-##-##',

        })

        document.querySelectorAll("input[type='tel']").forEach(input => {
            input.addEventListener('focus', e => input.value = (input.value.length ? input.value : '+7'))
            input.addEventListener('blur', e => input.value = (input.value == '+7' ? '' : input.value))
        })

        new MaskInput("[data-input-mask='time']", {
            mask: (value) => {

                if (value[1] == ':' || value[1] == '-' || value[1] == '.') {
                    return '#:##'
                }


                return '##:##'

            },

            postProcess: (value) => {

                let arr = [];

                value.split(':').forEach((num, index) => {
                    if (index == 0) Number(num) > 23 ? arr.push(23) : arr.push(num)
                    if (index == 1) Number(num) > 59 ? arr.push(59) : arr.push(num)
                })

                return arr.join(':')

            }

        })

        new MaskInput("[data-input-mask='number']", {
            mask: '9',
            tokens: {
                9: {
                    pattern: /[0-9]/,
                    repeated: true
                },
            }
        })
    }

    initMask();


    /* ==============================================
    debounce
    ==============================================*/

    window.debounce = function (method, delay) {
        clearTimeout(method._tId);
        method._tId = setTimeout(function () {
            method();
        }, delay);
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
                this.elForm = this.$el.querySelector('form')
                this.suggest = this.$el.querySelector('[data-index-find="suggest"]')
                this.closeButton = null;
                this.isiOS = /iPad|iPhone|iPod/.test(navigator.platform) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

                this.events()
            }

            lockScroll(val) {
                if (val) {
                    //fix iOS body scroll
                    if (this.isiOS) {
                        document.documentElement.classList.add('safari-fixed')
                        document.body.style.marginTop = `-${ window.scrollY }px`
                    }
                    document.body.classList.add('page-hidden')
                } else {

                    //fix iOS body scroll
                    let documentBody = document.body

                    if (this.isiOS) {
                        if (document.documentElement.classList.contains('safari-fixed')) document.documentElement.classList.remove('safari-fixed')
                        const bodyMarginTop = parseInt(documentBody.style.marginTop, 10)
                        documentBody.style.marginTop = ''
                        if (bodyMarginTop || bodyMarginTop === 0) window.scrollTo(0, -bodyMarginTop)
                    }

                    documentBody.classList.remove('page-hidden')
                }
            }

            open() {

                if (!this.form.classList.contains('is-focus')) {
                    this.input.blur()
                }

                this.form.classList.add('is-focus')
                this.lockScroll(true)
                this.createCloseButton()

                this.input.focus()

            }

            close() {

                this.input.blur()
                this.lockScroll(false)
                if (this.closeButton) {
                    this.closeButton.remove()
                }

                setTimeout(() => {
                    this.form.classList.remove('is-focus')
                }, 100)

                // this.input.setAttribute('readonly', 'on')
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
                return localStorage.getItem('findRecent') ? JSON.parse(localStorage.getItem('findRecent')) : []
            }

            setRecentRequest(val) {

                if (!localStorage.getItem('findRecent') || localStorage.getItem('findRecent') == '[]') {
                    let arr = []
                    arr.push(val)
                    localStorage.setItem('findRecent', JSON.stringify(arr))
                } else {
                    let array = JSON.parse(localStorage.getItem('findRecent'))
                    array.unshift(val)
                    localStorage.setItem('findRecent', JSON.stringify(array.slice(0, 8)))
                }

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

                recentList.forEach((li, index) => {

                    const elem = document.createElement('li')
                    elem.innerHTML = `<span>${li}</span>  <span class="icon-cross" ></span>`

                    const elRemove = elem.querySelector('.icon-cross')

                    elRemove.addEventListener('click', e => {

                        e.stopPropagation(true)

                        if (localStorage.getItem('findRecent')) {
                            let words = JSON.parse(localStorage.getItem('findRecent'))

                            if (Array.isArray(words)) {
                                words.splice(index, 1)
                                localStorage.setItem('findRecent', JSON.stringify(words))
                                elem.remove()
                            }
                        }
                    })

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

                this.input.addEventListener('click', e => {



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

                this.elForm.addEventListener('submit', e => {

                    e.preventDefault()
                    this.setRecentRequest(e.target.querySelector('input[type="text"]').value)

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

                this.$el.classList.add('fade-close-animation')

                setTimeout(() => {
                    this.$el.classList.remove('open')
                    this.$el.classList.remove('fade-close-animation')

                }, 400)

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

            getColumnMenu(menu) {
                let items = menu.querySelector('.sub-menu').children
                let result = [
                    document.createElement('ul'),
                    document.createElement('ul'),
                    document.createElement('ul'),
                ];

                let column = 0;

                Array.from(items).forEach(li => {
                    result[column].append(li)
                    column <= 1 ? column++ : column = 0
                })

                return result[0].outerHTML + result[1].outerHTML + result[2].outerHTML
            }


            openSubDesctop(item) {

                if (item.querySelector('.sub-menu')) {

                    item.classList.add('is-hover')

                    const template = `
                       <div class="catalog-popup__catig" >${item.querySelector('a').innerText}</div>
                       <div class="catalog-popup__list" >${this.getColumnMenu(item.cloneNode(true))}</div>
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

                    // закрывать при переходе на другую страницу
                    layer.querySelectorAll('a').forEach(link => {
                        link.addEventListener('click', e => {
                            setTimeout(() => {
                                this.close()
                            }, 200)
                        })
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

                // window.addEventListener('resize', e => this.close())


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
            mobileInBottom: true
        })

        const formElement = document.querySelector('[data-popup="select-region"]')

        document.querySelector('[data-popup="region"]').addEventListener('click', function (e) {
            e.preventDefault()

            selectRegionPopup.open(formElement.outerHTML, function (instanse) {
                if (instanse.querySelectorAll('.input--suggest')) {
                    instanse.querySelectorAll('.input--suggest input').forEach(function (input) {

                        new inputSuggest({
                            elem: input,
                            maxHeightSuggestList: '130px',
                            on: {
                                change: function (text, value) {
                                    //change event
                                }
                            }
                        });

                        //fix scroll to input in iOS 

                        if (input && window.isIOS) {
                            input.addEventListener('focus', e => {
                                setTimeout(() => {
                                    window.scrollTo({
                                        top: 300,
                                        behavior: "smooth",
                                    });
                                }, 50)
                            })
                        }




                    })
                }
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
    color clear filter
    =========================================*/

    // if (document.querySelector('.filter-properties__colors')) {
    //     const checkboxes = document.querySelectorAll('.filter-properties__colors')
    //     checkboxes.forEach(container => {

    //         if (container.querySelector('input:checked')) {
    //             clearButton.style.setProperty('display', 'block')
    //         }

    //         container.querySelectorAll('input[type="checkbox"]').forEach(item => {

    //             const clearButton = container.querySelector('.clear-color-filter')

    //             item.addEventListener('change', e => {
    //                 if (container.querySelector('input:checked')) {
    //                     clearButton.style.setProperty('display', 'block')
    //                 } else {
    //                     clearButton.style.setProperty('display', 'none')
    //                 }
    //             })

    //             clearButton.addEventListener('click', e => {
    //                 container.querySelectorAll('input[type="checkbox"]:checked').forEach(item => item.checked = false)
    //                 clearButton.style.setProperty('display', 'none')
    //             })
    //         })
    //     })
    // }


    /* =========================================
     color clear filter 1
    =========================================*/

    if (document.querySelector('.product-details__colors')) {
        const checkboxes = document.querySelectorAll('.product-details__colors')
        checkboxes.forEach(container => {

            let lis = container.querySelectorAll('li');

            if (lis.length > 1) {
                const clearButton = document.createElement('span')
                clearButton.classList.add('icon-cross')
                clearButton.classList.add('clear-color-filter')

                clearButton.addEventListener('click', e => {
                    container.querySelectorAll('input:checked').forEach(item => item.checked = false)
                    e.target.style.setProperty('display', 'none')


                    // if (container.classList.contains('filter-properties__colors')) {
                    //     //filter send
                    //     window.Filter.items.submit()
                    // }
                    // if (container.classList.contains('product-details__colors')) {
                    //     //filter send
                    //     window.location.href = window.location.protocol + '//' + window.location.host + window.location.pathname
                    // }


                })

                container.querySelector('ul').append(clearButton)

                if (container.querySelector('input:checked')) {
                    clearButton.style.setProperty('display', 'block')
                }

                container.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(item => {

                    item.addEventListener('change', e => {
                        if (container.querySelector('input:checked')) {
                            clearButton.style.setProperty('display', 'block')
                        } else {
                            clearButton.style.setProperty('display', 'none')
                        }
                    })


                })
            }

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

        class filterPopupMobile {
            constructor(params) {
                this.$el = params.el
                this.isOpen = false;
                this.container = document.querySelector('[data-filter-container="' + params.el.dataset.elem + '"]')
                this.addEvents()
            }

            open() {
                document.body.classList.add('is-open-filter')
                this.container.classList.add('is-open')
                document.body.classList.add('page-hidden')

                setTimeout(() => {
                    if (typeof initPriceRange !== undefined) initPriceRange()

                    //fix iOS body scroll
                    if (this.isiOS) {
                        document.body.style.marginTop = `-${ (window.scrollY ) }px`
                        document.documentElement.classList.add('safari-fixed')
                    }


                }, 50)
            }

            close() {
                document.body.classList.remove('is-open-filter')
                this.container.classList.remove('is-open')
                document.body.classList.remove('page-hidden')

                //fix iOS body scroll

                let documentBody = document.body

                if (this.isiOS) {
                    if (document.documentElement.classList.contains('safari-fixed')) document.documentElement.classList.remove('safari-fixed')
                    const bodyMarginTop = parseInt(documentBody.style.marginTop, 10)
                    documentBody.style.marginTop = ''
                    if (bodyMarginTop || bodyMarginTop === 0) window.scrollTo(0, -bodyMarginTop)
                }

            }

            toggleButton() {
                this.isOpen = !this.isOpen
                this.isOpen ? this.open() : this.close()
            }

            addEvents() {

                if (typeof this.container === 'undefined') {
                    console.error('error filterPopupMobile: not found container')
                    return false;
                }

                this.$el.addEventListener('click', e => this.toggleButton(e))

                this.container.querySelectorAll('[data-filter="open"]').forEach(item => {
                    item.addEventListener('click', e => this.toggleButton(e))
                })
            }


        }

        const items = document.querySelectorAll('[data-filter="open"]:not(.icon-cross)')

        items.forEach(item => {
            new filterPopupMobile({
                el: item
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

    /* ===========================================
    vh fix
    ===========================================*/

    function vh__fix() {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    /* =========================================
    change view catalog
    =========================================*/

    function changeViewCatalog() {
        let btnList = document.querySelector('[data-view="list"]')
        let btnGrid = document.querySelector('[data-view="grid"]')
        let catalog = document.querySelector('[data-catalog="container"]')

        if (btnList && document.body.clientWidth < 992 && catalog.classList.contains('grid--view')) {

            btnList.classList.add('is-active')
            if (btnGrid.classList.contains('is-active')) {
                btnGrid.classList.remove('is-active')
            }

            if (catalog.classList.contains('grid--view')) {
                catalog.classList.remove('grid--view')
            }

        }

        //favorites

        if (document.querySelector('.catalog-products--wishlist')) {

            let currentBlock = document.querySelector('.catalog-products--wishlist')

            if (document.body.clientWidth < 992) {
                currentBlock.classList.remove('grid--view')
            } else {
                currentBlock.classList.add('grid--view')
            }
        }


    }

    changeViewCatalog()
    vh__fix()

    window.addEventListener('resize', () => {
        vh__fix()
        changeViewCatalog()
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
                992: {
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

                    function offset(el) {
                        var rect = el.getBoundingClientRect(),
                            scrollLeft = window.scrollX || document.documentElement.scrollLeft,
                            scrollTop = window.scrollY || document.documentElement.scrollTop;
                        return {
                            top: rect.top + scrollTop,
                            left: rect.left + scrollLeft
                        }
                    }

                    switch (this.setting.scroll) {

                        case 'container':
                            window.scrollTo({
                                top: ((offset(this.container).top - 80) || 0),
                                behavior: 'smooth'
                            })

                            break;

                        case 'top':
                        default:

                            window.scrollTo({
                                top: (document.querySelector('header').clientHeight || 0),
                                behavior: 'smooth'
                            })
                            break;

                    }


                }
            }

            this.setting.onChangeTab(tab)

            if (document.querySelector('#my-slider')) {
                initPriceRange()
            }

        }

        clickTab() {

            //  this.nav.querySelectorAll('a').forEach(function (item) {
            //      item.addEventListener('click', function (event) {
            //          _this.changeTab((this.getAttribute('href').replace('#', '')))
            //      })
            //  })

            const _this = this

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
        scroll: 'top',

        onChangeTab: function (tab) {
            //console.log('info', tab)
        }
    })

    //single-shop
    window.tabsSingleProduct = new Tabs({
        navElem: '[data-tab-nav="store"]',
        containerElem: '[data-tab-container="store"]',
        tabStart: 'review',
        scroll: 'container',

        onChangeTab: function (tab) {
            //console.log('info', tab)
        }
    })




    /* ======================================
    fixed nav single product
    ======================================*/

    if (document.querySelector('.single-product__tabs')) {

        const elemTabs = document.querySelector('.single-product__tabs')
        const getOffsetTop = function (element) {
            if (!element) return 0;
            return getOffsetTop(element.offsetParent) + element.offsetTop;
        };

        const heihgtTabs = (getOffsetTop(elemTabs) + (elemTabs.clientHeight))

        function handleScroll() {

            if (window.scrollY > heihgtTabs) {
                elemTabs.classList.add('fixed-tabs')
            } else {

                if (elemTabs.classList.contains('fixed-tabs') && !document.documentElement.classList.contains('safari-fixed')) {
                    elemTabs.classList.remove('fixed-tabs')
                }

            }
        }

        let fnDedounce = window.debounce

        window.addEventListener('scroll', () => {
            fnDedounce(handleScroll, 10);
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

                e.target.closest('span').append(this.tooltip)
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

                    item.addEventListener('click', e => {

                        //for desctop
                        if (document.body.clientWidth > 576) {

                            this.tooltipDesctop(e)

                            //add event close on scroll
                            window.addEventListener('scroll', e => {
                                this.tooltipRemove()
                            })

                            //add event close on outher click 
                            document.addEventListener('click', e => {
                                if (!e.target.closest('[data-prop-tooltip]'))
                                    this.tooltipRemove()
                            })

                        } else {

                            //for mobile
                            this.tooltipPopup(e)

                        }

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

                this.showHideLongText()
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
                    type: 'GET', //POST
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

        showHideLongText() {

            let countChars = document.body.clientWidth > 576 ? 500 : 150

            document.querySelectorAll('.card-review__text').forEach(item => {
                if (item.innerText.length > countChars) {
                    item.classList.add('crop--text')

                    let showButton = document.createElement('div')
                    showButton.classList.add('card-review__more')
                    showButton.innerText = 'Читать полностью'

                    showButton.addEventListener('click', e => {
                        if (item.classList.contains('crop--text')) {
                            item.classList.remove('crop--text')
                            showButton.innerText = 'Cвернуть'
                        } else {
                            item.classList.add('crop--text')
                            showButton.innerText = 'Читать полностью'
                        }
                    })

                    item.after(showButton)
                }
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

        function openGalleryProduct(index) {
            const img = document.querySelectorAll('.product-images__large img')
            const arrImage = [];

            img.forEach(image => {
                arrImage.push(image.getAttribute('src'))
            })

            const instance = new FsLightbox();
            instance.props.dots = true;
            instance.props.type = "image";
            instance.props.sources = arrImage;
            instance.open(index)

        }

        document.querySelector('.product-images__all').addEventListener('click', e => {
            openGalleryProduct(0)
        })

        document.querySelectorAll('.product-images__large .splide__slide').forEach((item, index) => {
            item.addEventListener('click', e => openGalleryProduct(index))
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

    if (document.querySelector('[data-review="create-review-shop"]')) {

        const items = document.querySelectorAll('[data-review="create-review-shop"]')
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
                        url: '/_popup-create-review-shop.html',
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


    /* =========================================
    create review
    =========================================*/

    if (document.querySelector('[data-review="no-login"]')) {
        const noLoginPopup = new afLightbox({
            mobileInBottom: false
        })

        //click
        document.querySelector('[data-review="no-login"]').addEventListener('click', e => {
            window.ajax({
                type: 'GET', //POST
                url: '/_popup-no-login-review.html',
                responseType: 'html',

            }, (status, response) => {

                noLoginPopup.open(response, (instance) => {
                    //after open
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

    /* ======================================
    compare remove
    ======================================*/

    if (document.querySelector('[data-comare="remove"]')) {
        const items = document.querySelectorAll('[data-comare="remove"]')

        items.forEach(item => {
            item.addEventListener('click', e => {
                if (confirm('Удалить товар?')) {
                    // ajax 
                }
            })
        })

    }

    /* ======================================
    compare table width
    ======================================*/



    /* =============================================
    compare scroll
    =============================================*/

    if (document.querySelector('.compare-table__wrp')) {

        window.InitScrollCompare = function ($el) {
            let widthWrp = $el.querySelector('.compare-table__wrp')
            let widthTable = $el.querySelector('.compare-table__wrp > table')
            let scrollerWrp = $el.querySelector('.table-scroller__wrp')
            let scrollerContent = $el.querySelector('.table-scroller__content')
            let scroller = $el.querySelector('.table-scroller')
            let groups = $el.querySelectorAll('.product-table__group')

            groups.forEach(item => {
                item.style.width = widthTable.clientWidth + 'px'
            })


            scrollerWrp.style.width = widthWrp.clientWidth + 'px'
            scrollerContent.style.width = widthTable.clientWidth + 'px'

            scrollerWrp.addEventListener('scroll', e => {

                if (scroller.classList.contains('is-hover-scroller')) {
                    widthWrp.scrollLeft = e.target.scrollLeft
                }

            })

            widthWrp.addEventListener('scroll', e => {
                scrollerWrp.scrollLeft = e.target.scrollLeft
            })

            scroller.addEventListener('mouseenter', e => {
                e.target.classList.add('is-hover-scroller')
            })
            scroller.addEventListener('mouseleave', e => {
                e.target.classList.contains('is-hover-scroller') ? e.target.classList.remove('is-hover-scroller') : ''
            })
        }

        //compare
        window.tabsSingleProduct = new Tabs({
            navElem: '[data-tab-nav="compare"]',
            containerElem: '[data-container="compare"]',
            tabStart: '1',
            scroll: 'top',

            onChangeTab: function (tab) {

                //init scroll
                window.InitScrollCompare(document.querySelector('.single-page__item.active'))

                //computed table width
                if (document.querySelector('.compare-table')) {

                    document.querySelectorAll('.compare-table').forEach(item => {
                        const products = item.querySelectorAll('.compare-product');
                        let widthWrp = item.querySelector('.compare-table__wrp')
                        const widthUnit = 250;
                        const table = item

                        if (widthWrp.clientWidth > (products.length * widthUnit)) {
                            table.style.width = (products.length * widthUnit) + 'px'
                        }
                    })

                }

                //reinit slider

                if (document.querySelector('.single-page__item.active .compare-box').compareSlider) {
                    document.querySelector('.single-page__item.active .compare-box').compareSlider.update()
                }

            }
        })



    }



    /* =====================================
    compare slider
    =====================================*/

    class CompareSlider {

        constructor(elem) {
            this.elem = elem
            this.container = this.elem.querySelector('.compare-table__wrp')
            this.items = this.container.querySelectorAll('.compare-product')

            this.containerW = this.elem.querySelector('.compare-table__wrp')
            this.containerTable = this.elem.querySelector('.compare-table__wrp table')
            this.leftPX = 0
            this.itemWidth = 230

            this.nav = {
                next: this.elem.querySelector('[data-se-slider="next"]'),
                prev: this.elem.querySelector('[data-se-slider="prev"]'),
            }
            this.activeSlide = 0

            this.init();

        }

        init() {
            this.addEvent()
            this.nav.prev.dataset.state = '0'

            if (this.container.scrollWidth <= this.container.offsetWidth) {
                this.nav.next.dataset.state = '0'
            }
        }

        update() {

            if (this.container.scrollWidth <= this.container.offsetWidth) {
                this.nav.next.dataset.state = '0'
            } else {
                this.nav.next.dataset.state = '1'
            }



        }

        scrollElement(container, stepOffset, _this) {

            _this.leftPX = this.container.scrollLeft + Number(stepOffset)

            container.scrollTo({
                left: _this.leftPX,
                behavior: 'smooth'
            });

        }

        changeSlide() {

            this.items.forEach(item => {
                if (item.classList.contains('active'))
                    item.classList.remove('active')
            })

            if (this.items.length) {
                this.items[this.activeSlide].classList.add('active')
                this.scrollElement(this.container, this.items[this.activeSlide], this)
            }
        }

        nextSlide() {

            if (this.leftPX < (this.containerTable.clientWidth - this.containerW.clientWidth) - 20) {
                this.scrollElement(this.container, this.itemWidth, this)
            }

        }

        prevSlide() {
            this.scrollElement(this.container, -this.itemWidth, this)
        }

        addEvent() {
            this.nav.next.addEventListener('click', () => {
                this.nextSlide()

                console.log('next')
            })
            this.nav.prev.addEventListener('click', () => {
                this.prevSlide()

                console.log('prev')
            })

            this.container.addEventListener('scroll', (e) => {
                this.nav.prev.dataset.state = (e.target.scrollLeft < 10 ? '0' : '1')
                this.nav.next.dataset.state = ((e.target.scrollWidth - (this.container.offsetWidth + 50) <= e.target.scrollLeft) ? '0' : '1')

                if (e.target.scrollLeft < 10) {
                    this.activeSlide = 0
                }
            })
        }

    }

    if (document.querySelector('[data-container="compare"]')) {

        document.querySelectorAll('.compare-box').forEach(item => {
            item['compareSlider'] = new CompareSlider(item)
            window.InitScrollCompare(item)
        })

    }

    /* =====================================
    compare show/hide
    =====================================*/

    if (document.querySelector('.compare-table__wrp')) {

        const groups = document.querySelectorAll('.product-table__group')
        const items = document.querySelectorAll('.compare-table__wrp tbody')

        groups.forEach(group => {
            group.addEventListener('click', e => {


                if (group.classList.contains('is-hide-group')) {
                    group.classList.add('is-hide-group--close')
                    hideTbody(items)
                    group.classList.remove('is-hide-group')
                    group.classList.remove('is-hide-group--close')
                } else {
                    group.classList.add('is-hide-group')
                    showTbody(items)
                }

            })
        })

        function showTbody(items) {
            let flag = false

            items.forEach(item => {

                if (item.classList.contains('is-hide-group')) {
                    flag = true
                    return false
                }

                // alert('ee')

                if (flag && !item.classList.contains('product-table__group')) {

                    item.classList.add('hide-tbody')

                } else {
                    flag = false
                }
            })
        }

        function hideTbody(items) {
            let flag = false

            items.forEach(item => {

                if (item.classList.contains('is-hide-group--close')) {
                    flag = true
                    return false
                }

                // alert('ee')

                if (flag && !item.classList.contains('product-table__group')) {

                    if (item.classList.contains('hide-tbody')) {
                        item.classList.remove('hide-tbody')
                    }

                } else {
                    flag = false
                }
            })
        }



    }

    /* ====================================
    hide similar prop
    ====================================*/

    if (document.querySelector('.product-table__prop')) {


        const buttonShow = document.querySelectorAll('[data-similar="show"]')
        const buttonHide = document.querySelectorAll('[data-similar="hide"]')
        const props = document.querySelectorAll('.product-table__prop')

        buttonShow.forEach(item => {
            item.addEventListener('click', e => {
                showSimilarProp()
                changeActive('show')
            })
        })

        buttonHide.forEach(item => {
            item.addEventListener('click', e => {
                hideSimilarProp()
                changeActive('hide')
            })
        })


        function showSimilarProp() {
            props.forEach(prop => {
                if (prop.classList.contains('hide-prop-tbody')) {
                    prop.classList.remove('hide-prop-tbody')
                }
            })
        }

        function hideSimilarProp(prop) {
            props.forEach(prop => {
                const arr = new Set()
                prop.querySelectorAll('td').forEach(td => {
                    arr.add(td.innerText)
                })

                if (arr.size <= 2) {
                    prop.classList.add('hide-prop-tbody')
                }
            })
        }

        function changeActive(data) {
            const buttons = document.querySelectorAll('[data-similar]')



            buttons.forEach(item => {

                console.log(item.dataset.similar)
                console.log(data)

                if (item.dataset.similar == data) {
                    item.classList.add('is-active')
                } else {
                    if (item.classList.contains('is-active')) {
                        item.classList.remove('is-active')
                    }
                }
            })

        }




    }

    /* ==========================================
    add to compare
    ==========================================*/

    function WishList(params) {

        this.elemCookie = params.elemCookie;
        this.elemTotal = document.querySelector(params.elemTotal);

        this.init = function () {
            this.getTotal()
        }

        this.getTotal = function () {

            if (this.getArray().length) {
                this.elemTotal.innerText = this.getArray().length;
            } else {
                this.elemTotal.innerText = '';
            }

        }

        this.getArray = function () {
            if (!Cookies.get(this.elemCookie)) return new Array()

            return String(Cookies.get(this.elemCookie)).split(',')
        }

        this.add = function (id) {
            var array = this.getArray();
            array.push(id)
            array = Array.from(new Set(array))

            Cookies.set(this.elemCookie, array.join(','), {
                expires: 7
            })
            this.getTotal()
            return array;
        }

        this.remove = function (id) {

            var array = this.getArray();
            var result = array.filter(function (item) {
                return item != id
            })

            Cookies.set(this.elemCookie, result.join(','), {
                expires: 7
            })
            this.getTotal()
            return array;

        }
    }

    /* ==========================================
    popup wishlist
    ==========================================*/

    function wishlistPopup(id, type) {

        if (!id) return false

        switch (type) {
            case 'wishlist':
                var url = '_wishlist-popup.html';
                break;
            case 'compare':
                var url = '_compare-popup.html';
                break;

            default:
                var url = '_compare-popup.html';
        }

        window.ajax({
            type: 'GET',
            url,
            data: {
                id: id
            }
        }, (status, response) => {


            if (document.querySelector('main')) {

                let elem = document.createElement('div')
                let main = document.querySelector('main')

                elem.innerHTML = response
                elem.classList.add('popup-top-tooltip')

                elem.querySelector('[data-popup="close"]').addEventListener('click', e => {
                    elem.classList.add('fadeout')

                    setTimeout(() => {
                        elem.remove()
                    }, 1000)
                })

                //remove old
                main.querySelectorAll('.popup-top-tooltip').forEach(item => item.remove())
                main.append(elem)

                //add scroll event


                window.addEventListener('scroll', e => {

                    elem.classList.add('fadeout')

                    setTimeout(() => {
                        elem.remove()
                    }, 1000)
                })

            } else {
                window.STATUS.msg('Товар добавлен в избранное')
            }


        })

    }


    /*===========================================
    init wishlist
    ===========================================*/

    window.wishlistInstance = new WishList({
        elemCookie: 'wishlist',
        elemTotal: '[data-total="wishlist"]',
    });

    const WL = window.wishlistInstance;

    WL.init()

    const wishlist = document.querySelectorAll('[data-wishlist]');
    const arrayWishList = WL.getArray()

    wishlist.forEach(function (item, index) {

        const product_id = item.dataset.wishlist;

        if (arrayWishList.lastIndexOf(product_id) !== -1) {
            item.classList.add('active')
            item.dataset.tooltip = 'В избранном'

            if (item.querySelector('[data-wishlist-text]')) {
                item.querySelector('[data-wishlist-text]').innerText = item.dataset.tooltip = 'В избранном'
            }
        }

        item.addEventListener('click', function (event) {
            event.preventDefault()
            if (this.classList.contains('active')) {
                WL.remove(product_id)
                this.classList.remove('active')
                this.dataset.tooltip = 'Добавить в избранное'

                if (item.querySelector('[data-wishlist-text]')) {
                    item.querySelector('[data-wishlist-text]').innerText = item.dataset.tooltip = 'В избранное'
                }

            } else {
                WL.add(product_id)
                this.classList.add('active')
                this.dataset.tooltip = 'В избранном'

                if (item.querySelector('[data-wishlist-text]')) {
                    item.querySelector('[data-wishlist-text]').innerText = item.dataset.tooltip = 'В избранном'
                }

                wishlistPopup(product_id, 'wishlist')
            }
        })
    })


    /*===========================================
    init compare
    ===========================================*/

    window.compareInstance = new WishList({
        elemCookie: 'compare',
        elemTotal: '[data-total="compare"]',
    });

    const CMP = window.compareInstance;

    CMP.init()

    const compare = document.querySelectorAll('[data-compare]');
    const arrayCompare = CMP.getArray()

    compare.forEach(function (item, index) {

        const product_id = item.dataset.compare;

        if (arrayCompare.lastIndexOf(product_id) !== -1) {
            item.classList.add('active')
            item.dataset.tooltip = 'В сравнении'

            if (item.querySelector('[data-wishlist-text]')) {
                item.querySelector('[data-wishlist-text]').innerText = item.dataset.tooltip = 'В сравнении'
            }
        }

        item.addEventListener('click', function (event) {
            event.preventDefault()
            if (this.classList.contains('active')) {
                CMP.remove(product_id)
                this.classList.remove('active')
                this.dataset.tooltip = 'Добавить в сравнение'

                if (item.querySelector('[data-wishlist-text]')) {
                    item.querySelector('[data-wishlist-text]').innerText = item.dataset.tooltip = 'Сравнить'
                }

            } else {
                CMP.add(product_id)
                this.classList.add('active')
                this.dataset.tooltip = 'В сравнении'

                if (item.querySelector('[data-wishlist-text]')) {
                    item.querySelector('[data-wishlist-text]').innerText = item.dataset.tooltip = 'В сравнении'
                }

                wishlistPopup(product_id, 'compare')
            }
        })
    })


    /* ====================================
    help page category
    ====================================*/

    if (document.querySelector('.page-help__aside')) {

        const items = document.querySelectorAll('.page-help__aside .isset-sub')

        items.forEach(item => {
            item.addEventListener('click', e => {
                item.classList.toggle('is-open')

                if (e.target.closest('.icon-cross-show')) {
                    e.stopPropagation()
                    e.preventDefault()
                }

            })
        })

    }

    //open mobile 
    if (document.querySelector('[data-help="open"]')) {

        const buttonOpen = document.querySelector('[data-help="open"]')
        const menuContainer = document.querySelector('[data-help="menu"]')

        buttonOpen.addEventListener('click', e => {
            buttonOpen.classList.toggle('is-open')
            menuContainer.classList.toggle('is-open')
            document.body.classList.toggle('page-hidden')
        })

    }

    /* ====================================
    show-hide store details in mobile
    ====================================*/

    if (document.querySelector('.minicard__in-store')) {

        const items = document.querySelectorAll('.minicard__in-store')

        items.forEach(item => {
            item.addEventListener('click', e => {

                if (e.target.closest('a')) {
                    e.stopPropagation()
                    return false
                }

                if (e.target.closest('.minicard__more')) {
                    e.target.closest('.minicard__more').classList.toggle('is-open')
                }
            })
        })

    }


    /* =========================================
    show-hide
    =========================================*/

    if (document.querySelector('.personal-review')) {

        let countChars = document.body.clientWidth > 576 ? 500 : 150

        document.querySelectorAll('.review-product__text').forEach(item => {
            if (item.innerText.length > countChars) {
                item.classList.add('crop--text')

                let showButton = document.createElement('div')
                showButton.classList.add('card-review__more')
                showButton.innerText = 'Читать полностью'

                showButton.addEventListener('click', e => {
                    if (item.classList.contains('crop--text')) {
                        item.classList.remove('crop--text')
                        showButton.innerText = 'Cвернуть'
                    } else {
                        item.classList.add('crop--text')
                        showButton.innerText = 'Читать полностью'
                    }
                })

                item.after(showButton)
            }
        })
    }


    /* ==========================================
      suggest input
    ========================================== */

    class inputSuggest {

        constructor(option) {
            this.option = option
            this.elem = option.elem
            this.maxHeightSuggestList = this.option.maxHeightSuggestList || false
            this.list = document.createElement('ul');
            this.init()
        }

        init() {
            this.createSuggestList()
            this.addEvent()

            if (this.maxHeightSuggestList) {
                this.list.style.maxHeight = this.maxHeightSuggestList
            }
        }

        createSuggestList() {

            let _this = this

            this.loadSuggestElem(this.elem.dataset.url, function (arr) {

                _this.list.querySelectorAll('li').forEach((removeItem) => {
                    removeItem.remove()
                })

                // if (!arr.isArray()) {
                //     console.error('error: no json-data for suggest')
                //     return false;
                // }

                arr.forEach((item) => {
                    let li = document.createElement('li')
                    li.innerText = item.text
                    li.setAttribute('rel', item.value)

                    _this.eventListItem(li)
                    _this.list.append(li)
                })
            })

            this.list.classList.add('suggest-list')

            this.mountList()

        }

        mountList() {

            if (this.elem.parentNode.querySelector('.suggest-list')) {
                this.elem.parentNode.querySelector('.suggest-list').remove()
            }

            this.elem.parentNode.append(this.list)

        }

        loadSuggestElem(url, callback) {
            window.ajax({
                type: 'GET',
                responseType: 'json',
                url: url
            }, function (status, response) {
                callback(response)
            })
        }

        changeInput(event) {

            let value = event.target.value.toLowerCase()

            if (true) {

                this.list.style.display = 'initial'

                this.list.querySelectorAll('li').forEach(function (li) {

                    if (li.classList.contains('hide')) {
                        li.classList.remove('hide')
                    }

                    if (li.innerText.toLowerCase().indexOf(value) == -1 && value.length) {
                        li.classList.add('hide')
                    }
                })

                //update list
                this.mountList()
            }
        }

        closeList() {
            this.list.style.display = 'none'

            if (!this.elem.value.length) {
                this.elem.removeAttribute('area-valid')
                this.option.on.change('', false)
            }

        }
        openList() {
            this.list.style.display = 'block'
            this.elem.setAttribute('area-valid', true)
            this.createSuggestList()
        }

        addEvent() {
            this.elem.addEventListener('keyup', (event) => {
                this.changeInput(event)
            })
            this.elem.addEventListener('focus', (event) => {
                this.openList()
            })

            this.elem.addEventListener('click', (event) => {
                event.stopPropagation()
            })
            this.elem.addEventListener('blur', () => {
                setTimeout(() => {
                    this.closeList()
                }, 100)
            })
        }

        eventListItem(li) {
            li.addEventListener('click', (event) => {
                this.elem.setAttribute('area-valid', true)
                this.elem.value = event.target.innerText
                this.closeList()
                this.option.on.change(event.target.innerText, event.target.getAttribute('rel'))
            })
        }

    }

    if (document.querySelector('[data-suggest="input"]')) {

        document.querySelectorAll('[data-suggest="input"]').forEach(input => {
            new inputSuggest({
                elem: input,
                maxHeightSuggestList: '220px',
            });
        })


    }

    /* ========================================
    data-review="show-comment"
    ========================================*/

    if (document.querySelector('[data-review="show-comment"]')) {
        document.querySelectorAll('[data-review="show-comment"]').forEach(item => {
            item.addEventListener('click', e => {
                e.target.closest('.review-product').querySelector('.review-product__childs').classList.toggle('is-open')
                item.classList.toggle('is-open')

                if (item.classList.contains('is-open')) {
                    item.innerHTML = 'Скрыть комментарии'
                } else {
                    item.innerHTML = 'Все комментарии (1)'
                }
            })
        })
    }

    /* ===========================================
     popup login
     ============================================= */

    function openLoginUser() {
        const loginPopup = new afLightbox({
            mobileInBottom: true
        })

        loginPopup.open('<div class="af-spiner" ></div>', function (instanse) {
            window.ajax({
                type: 'GET',
                url: '/personal/_popup-login.html',
                responseType: 'html',
                data: {
                    value: 0
                }
            }, (status, response) => {
                loginPopup.changeContent(response)

                //add event click registration popup
                if (loginPopup.modal.querySelector('[data-popup="store-registration"]')) {
                    loginPopup.modal.querySelector('[data-popup="store-registration"]').addEventListener('click', e => {

                        loginPopup.close()
                        setTimeout(() => {
                            openRegistrationUser()
                        }, 200)
                    })
                }

                //add event click pasword recovery popup
                if (loginPopup.modal.querySelector('[data-popup="store-recovery"]')) {
                    loginPopup.modal.querySelector('[data-popup="store-recovery"]').addEventListener('click', e => {

                        loginPopup.close()
                        setTimeout(() => {
                            openRecoveryPassword()
                        }, 200)
                    })
                }



                //

            })
        })
    }

    if (document.querySelector('[data-popup="login"]')) {

        const buttons = document.querySelectorAll('[data-popup="login"]')

        buttons.forEach(element => {
            element.addEventListener('click', function (e) {
                e.preventDefault()
                openLoginUser();
            })
        });


    }

    /* ===========================================
    popup recovery password
    ============================================= */

    function openRecoveryPassword() {
        const RecoveryPassword = new afLightbox({
            mobileInBottom: true
        })

        RecoveryPassword.open('<div class="af-spiner" ></div>', function (instanse) {
            window.ajax({
                type: 'GET',
                url: '/personal/_popup-recovery.html',
                responseType: 'html',
                data: {
                    value: 0
                }
            }, (status, response) => {
                RecoveryPassword.changeContent(response)


                if (RecoveryPassword.modal.querySelector('[data-back="login"]')) {
                    RecoveryPassword.modal.querySelector('[data-back="login"]').addEventListener('click', e => {
                        RecoveryPassword.close()
                        openLoginUser()
                    })

                }

                const form = RecoveryPassword.modal.querySelector('[data-store-form="recovery"]')
                form.addEventListener('submit', e => {
                    e.preventDefault()


                    //send success
                    RecoveryPassword.close()
                    openRecoveryCheckEmail()
                })

            })
        })
    }

    /* ==============================================
      form recovery check email
     ==============================================*/

    function openRecoveryCheckEmail() {
        const CHECKEMAILPOPUP = new afLightbox({
            mobileInBottom: true
        })

        window.ajax({
            type: 'GET',
            url: '/store/_popup-check-email.html',
            responseType: 'html',
            data: {
                value: 0
            }
        }, (status, response) => {
            CHECKEMAILPOPUP.open(response, (html) => {
                html.querySelector('.btn').addEventListener('click', e => CHECKEMAILPOPUP.close())
            })
        })

    }

    /* ===========================================
    popup registration
    ============================================= */

    function openRegistrationUser() {
        const registerPopup = new afLightbox({
            mobileInBottom: true
        })

        registerPopup.open('<div class="af-spiner" ></div>', function (instanse) {
            window.ajax({
                type: 'GET',
                url: '/personal/_popup-registration.html',
                responseType: 'html',
                data: {
                    value: 0
                }
            }, (status, response) => {
                registerPopup.changeContent(response)

                // init mask
                initMask()

                //form
                const form = document.querySelector('[data-store-form="registration"]')

                //init suggest

                new inputSuggest({
                    elem: registerPopup.modal.querySelector('.input--suggest input'),
                    maxHeightSuggestList: '220px',
                    on: {
                        change: function (text, value) {
                            //change event
                        }
                    }
                });

                // form submit

                form.addEventListener('submit', e => {

                    let err = [];

                    form.querySelectorAll('input').forEach(input => {
                        if (!input.validity.valid) {
                            e.target.querySelector('[data-step="1"]').classList.add('is-validate')
                            window.STATUS.err('Заполните обязательные поля')
                            err.push('err')
                        }
                    })

                    if (!err.length) {
                        //ajax send data
                        registerPopup.close()
                        openThanksPopup()
                    }

                    e.preventDefault()


                })


            })
        })
    }

    if (document.querySelector('[data-popup="registration"]')) {

        const buttons = document.querySelectorAll('[data-popup="registration"]')

        buttons.forEach(element => {
            element.addEventListener('click', function (e) {
                e.preventDefault()
                openRegistrationUser();
            })
        });
    }

    /* ==============================================
     form thanks popup
    ==============================================*/

    function openThanksPopup() {
        const CHECKEMAILPOPUP = new afLightbox({
            mobileInBottom: true
        })

        window.ajax({
            type: 'GET',
            url: '/personal/_popup-thanks.html',
            responseType: 'html',
            data: {
                value: 0
            }
        }, (status, response) => {
            CHECKEMAILPOPUP.open(response, (html) => {
                html.querySelector('.btn').addEventListener('click', e => CHECKEMAILPOPUP.close())
            })
        })

    }

    /* =============================================
     user menu
     =============================================*/

    if (document.querySelector('[data-popup="user-menu"]')) {

        const button = document.querySelector('[data-popup="user-menu"]')

        button.addEventListener('click', e => {

            if (document.body.clientWidth <= 480) {
                const html = button.querySelector('.dropdown-button').outerHTML
                const userMenuPopup = new afLightbox({
                    mobileInBottom: true
                })
                userMenuPopup.open('<div class="user-menu-popup" >' + html + '</div>', (instance) => {

                    if (instance.querySelector('[data-popup="registration"]')) {



                        instance.querySelector('[data-popup="registration"]').addEventListener('click', item => {
                            openRegistrationUser()
                            userMenuPopup.close()
                        })
                        instance.querySelector('[data-popup="login"]').addEventListener('click', item => {
                            openLoginUser()
                            userMenuPopup.close()
                        })
                    }


                })
            }

        })

    }

    /* ======================================
    upload logo
    ======================================*/

    if (document.querySelector('[data-upload="logo-store"]')) {

        document.querySelector('[data-upload="logo-store"]').addEventListener('change', function () {

            const file = this.files[0];
            const _this = this;

            if (file.size / (1024 * 1024) > 5) { //5mb
                window.STATUS.err('Допустимы файлы не более 5 мб');
                return false;
            }

            if (file.type == 'image/jpeg' || file.type == 'image/png') {

                var reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function (e) {

                    let removeButton = document.querySelector('.personal-upload-logo__button .btn.btn-white')
                    let uploadButton = document.querySelector('.personal-upload-logo__button .btn')
                    let imgElem = document.querySelector('.personal-upload-logo__image span')

                    imgElem.style.backgroundImage = 'url(' + e.target.result + ')'
                    uploadButton.innerHTML = 'Заменить <span>аватар</span>'
                    removeButton.style.setProperty('display', 'block')

                    removeButton.addEventListener('click', e => {
                        _this.value = ''
                        imgElem.style.setProperty('background-image', 'url(' + imgElem.dataset.bg + ')')
                        uploadButton.innerHTML = 'Загрузить аватар'
                        removeButton.style.setProperty('display', 'none')
                    })
                }

            } else {
                window.STATUS.err('Допустимы только jpeg/png файлы')
            }


        })



    }

    /* ============================================
    review reply
    ============================================*/

    if (document.querySelector('[data-review="reply"]')) {
        document.querySelectorAll('[data-review="reply"]').forEach(item => {

            item.addEventListener('click', e => {
                e.target.closest('.card-review__main').querySelector('.card-review__form').classList.toggle('hide')
            })

        })
    }

    /* =============================================
    form personal config
    =============================================*/

    if (document.querySelector('[data-form="personal-config"]')) {

        const form = document.querySelector('[data-form="personal-config"]')
        const submitButton = form.querySelector('[type="submit"]')

        form.addEventListener('submit', e => {
            e.preventDefault()
            submitButton.setAttribute('disabled', 'disabled')

            //ajax request

        })

        form.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', e => {
                submitButton.removeAttribute('disabled')
            })
        })

    }

    /* =======================================
    review form scroll fix ios
    =======================================*/

    if (document.querySelector('.review-form__textarea')) {
        const textareas = document.querySelectorAll('.review-form__textarea textarea')

        textareas.forEach(item => {
            if (window.isIOS) {
                item.addEventListener('focus', e => {
                    setTimeout(() => {
                        window.scrollTo({
                            top: item.offsetTop - (window.innerHeight / 2) + item.clientHeight + 10,
                            behavior: "smooth",
                        });
                    }, 100)
                })
            }

        })
    }

    /* =======================================
    confirm cookie
    =======================================*/

    if (!Cookies.get('policy')) {
        document.querySelector('.bottom-popup').classList.add('open')

        document.querySelector('.bottom-popup__btn .btn').addEventListener('click', function () {
            Cookies.set('policy', 'true')
            document.querySelector('.bottom-popup').classList.remove('open')
        })

    }

    /*======================================
     banner slider
    ======================================*/

    if (document.querySelector('[data-slider="main-banner"]')) {
        const items = document.querySelectorAll('[data-slider="main-banner"]')

        items.forEach(item => {
            const sliderBanner = new Splide(item, {
                type: 'fade',
                perPage: 1,
                arrows: false
            })

            sliderBanner.mount()
        })

    }


});