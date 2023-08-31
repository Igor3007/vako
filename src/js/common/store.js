 document.addEventListener("DOMContentLoaded", function (event) {


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
             document.querySelector(this.containerElem).setAttribute('class', _type)
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

     /* ==========================================
     FileUpload
     ==========================================*/

     class FileUpload {
         constructor(files, action) {
             this.files = files
             this.action = action
         }

         ajax(params, response) {

             window.STATUS.msg('Загрузка файла...')
             let xhr = new XMLHttpRequest();

             xhr.responseType = 'json';
             xhr.open('POST', this.action)
             xhr.send(params.data)
             xhr.onload = function () {
                 response(xhr.status, xhr.response)
             };

             xhr.onerror = function () {
                 window.STATUS.err('Error: ajax request failed')
             };

             xhr.onreadystatechange = function () {

                 if (xhr.readyState == 1) {
                     window.STATUS.msg('Загрузка файла...')
                 }

                 if (xhr.readyState == 3) {
                     window.STATUS.msg('Загрузка файла...')
                 }

                 if (xhr.readyState == 4) {
                     setTimeout(function () {
                         //params.btn.classList.remove('btn-loading')
                         console.log('loaded')
                         // window.STATUS.msg('Завершение...')
                     }, 1000)
                 }

             };
         }

         upload(type, callback) {

             let formData = new FormData();

             formData.append('file', this.files.item(0))
             formData.append('type', type)

             let params = {
                 data: formData
             }

             this.ajax(params, function (status, response) {

                 if (!response) {
                     window.STATUS.err('Ошибка при загрузке файла')
                     return false
                 }

                 if (response.status) {
                     window.STATUS.msg(response.msg || 'Загрузка завершена!')
                 } else {
                     window.STATUS.err(response.msg || 'Ошибка при загрузке файла')
                 }

                 callback(response);
             })

         }

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

     let vh = window.innerHeight * 0.01;
     document.documentElement.style.setProperty('--vh', `${vh}px`);

     window.addEventListener('resize', () => {
         // We execute the same script as before
         let vh = window.innerHeight * 0.01;
         document.documentElement.style.setProperty('--vh', `${vh}px`);
     });


     /* ===========================================
     popup login
     ============================================= */

     function openLoginPartner() {
         const loginPopup = new afLightbox({
             mobileInBottom: true
         })

         loginPopup.open('<div class="af-spiner" ></div>', function (instanse) {
             window.ajax({
                 type: 'GET',
                 url: '/store/_popup-login.html',
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
                             openRegistrationPartner()
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

     if (document.querySelector('[data-popup="store-login"]')) {

         const buttons = document.querySelectorAll('[data-popup="store-login"]')

         buttons.forEach(element => {
             element.addEventListener('click', function (e) {
                 e.preventDefault()
                 openLoginPartner();
             })
         });


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

     /* ==============================================
      form thanks popup
     ==============================================*/

     function openThanksPopup() {
         const CHECKEMAILPOPUP = new afLightbox({
             mobileInBottom: true
         })

         window.ajax({
             type: 'GET',
             url: '/store/_popup-thanks.html',
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
     popup recovery password
     ============================================= */

     function openRecoveryPassword() {
         const RecoveryPassword = new afLightbox({
             mobileInBottom: true
         })

         RecoveryPassword.open('<div class="af-spiner" ></div>', function (instanse) {
             window.ajax({
                 type: 'GET',
                 url: '/store/_popup-recovery.html',
                 responseType: 'html',
                 data: {
                     value: 0
                 }
             }, (status, response) => {
                 RecoveryPassword.changeContent(response)

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


     /* ===========================================
     popup registration
     ============================================= */

     function openRegistrationPartner() {
         const registerPopup = new afLightbox({
             mobileInBottom: true
         })

         registerPopup.open('<div class="af-spiner" ></div>', function (instanse) {
             window.ajax({
                 type: 'GET',
                 url: '/store/_popup-registration.html',
                 responseType: 'html',
                 data: {
                     value: 0
                 }
             }, (status, response) => {
                 registerPopup.changeContent(response)

                 const steps = registerPopup.modal.querySelectorAll('.form-step')

                 //init select 
                 const selectCustom = new afSelect({
                     selector: '.login-partners select'
                 })
                 selectCustom.init()

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

                 if (steps.length) {

                     // enable first step
                     steps[0].style.display = 'block'

                     //next step
                     registerPopup.modal.querySelectorAll('[data-step="next"]').forEach(element => {
                         element.addEventListener('click', e => {

                             e.preventDefault()

                             let currentStep = e.target.closest('.form-step')
                             let err = [];

                             currentStep.querySelectorAll('input').forEach(input => {
                                 if (!input.validity.valid) {
                                     e.target.closest('.form').classList.add('is-validate')
                                     window.STATUS.err('Заполните обязательные поля')
                                     err.push('err')
                                 }
                             })

                             if (!err.length) {
                                 currentStep.style.display = 'none'

                                 if (currentStep.nextElementSibling) {
                                     currentStep.nextElementSibling.style.display = 'block'
                                 }
                             }

                         })
                     });

                     //prev step
                     registerPopup.modal.querySelectorAll('[data-step="prev"]').forEach(element => {
                         element.addEventListener('click', e => {

                             e.preventDefault()

                             let currentStep = e.target.closest('.form-step')
                             currentStep.style.display = 'none'

                             if (currentStep.previousElementSibling) {
                                 currentStep.previousElementSibling.style.display = 'block'
                             }
                         })
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
                 }

             })
         })
     }

     if (document.querySelector('[data-popup="store-registration"]')) {

         const buttons = document.querySelectorAll('[data-popup="store-registration"]')

         buttons.forEach(element => {
             element.addEventListener('click', function (e) {
                 e.preventDefault()
                 openRegistrationPartner();
             })
         });


     }

     /* =====================================
     upload price list
     =====================================*/

     if (document.querySelectorAll('[data-upload="input"] input')) {

         const items = document.querySelectorAll('[data-upload="input"] input')

         items.forEach(inputFile => {

             inputFile.addEventListener('change', e => {
                 const instanseFileUpload = new FileUpload(e.target.files, e.target.dataset.action)
                 instanseFileUpload.upload('price', (response) => {
                     console.log(response)

                     const parent = e.target.closest('div')
                     const inputURL = parent.querySelector('[data-upload="url"]')

                     if (inputURL) {
                         inputURL.value = response.url
                         inputURL.disabled = false

                         inputURL.dispatchEvent(new Event('change', {
                             'bubbles': true
                         }));
                     }


                 })
             })


         })

         // add event change url

         if (document.querySelectorAll('[data-upload="url"]')) {
             const itemsInput = document.querySelectorAll('[data-upload="url"]')

             itemsInput.forEach(input => {
                 input.addEventListener('change', (e) => {
                     const form = e.target.closest('form');
                     const sendButton = form.querySelector('[type="submit"]');
                     sendButton.disabled = (input.value ? false : true)
                 })
             })
         }

     }


     /*========================================
      change form
      ========================================*/

     if (document.querySelector('[data-store-user="form"]')) {
         const items = document.querySelector('[data-store-user="form"]')

         items.querySelectorAll('input').forEach(item => {
             item.addEventListener('change', e => {
                 e.target.closest('form').querySelector('[type="submit"]').removeAttribute('disabled')
             })
         })
     }

     /* ======================================
     upload logo
     ======================================*/

     if (document.querySelector('[data-upload="logo-store"]')) {

         document.querySelector('[data-upload="logo-store"]').addEventListener('change', function () {

             const file = this.files[0];

             if (file.size / (1024 * 1024) > 5) { //5mb
                 window.STATUS.err('Допустимы файлы не более 5 мб');
                 return false;
             }

             if (file.type == 'image/jpeg' || file.type == 'image/png') {

                 var reader = new FileReader();
                 reader.readAsDataURL(file);
                 reader.onload = function (e) {
                     document.querySelector('.shop-upload-logo__image span').style.backgroundImage = 'url(' + e.target.result + ')'
                 }
             } else {
                 window.STATUS.err('Допустимы только jpeg/png файлы')
             }


         })



     }

     /* =====================================
     open mobile aside
     =====================================*/

     class mobileAside {
         constructor() {
             this.$aside = document.querySelector('.store-panel__aside') || null;
             this.$items = document.querySelectorAll('[data-aside="open"]')

             if (this.$aside) {
                 this.events()
             }


         }

         open(item) {

             if (!item.classList.contains('is-open')) {
                 item.classList.add('is-open')
                 this.$aside.classList.add('is-open')
                 window.scrollTo({
                     top: 0
                 })
                 document.body.classList.add('hidden')
             } else {
                 this.close()
             }


         }

         close() {

             if (document.body.clientWidth > 992) {
                 return false
             }

             this.$aside.classList.add('slide-left-out')

             setTimeout(() => {
                 this.$aside.classList.remove('slide-left-out')
                 this.$aside.classList.remove('is-open')
                 document.body.classList.remove('hidden')
             }, 300)

             this.$items.forEach(item => {
                 item.classList.remove('is-open')
             })
         }

         events() {
             this.$aside.addEventListener('click', e => {

                 !e.target.closest('ul') ? this.close() : null

             })

             this.$items.forEach(item => {
                 item.addEventListener('click', e => {
                     this.open(item)
                 })
             })
         }
     }

     new mobileAside();

     /*================================================
     repeat field
     ================================================*/

     if (document.querySelector('.repeat-field')) {

         const buttons = document.querySelectorAll('.repeat-field');

         buttons.forEach(button => {
             button.addEventListener('click', e => {

                 const parent = e.target.closest('.form__subitem')

                 if (parent.querySelectorAll('input').length >= 3) {
                     window.STATUS.err('Допустимо не более 3 телефонов')
                     return false
                 }

                 const newPhone = document.createElement('div')
                 newPhone.innerHTML = '<span class="remove-field" ></span>'
                 newPhone.append(parent.querySelector('input').cloneNode(true))

                 newPhone.querySelector('input').value = ''
                 newPhone.querySelector('.remove-field').addEventListener('click', e => {
                     e.target.closest('div').remove()
                 })

                 parent.querySelector('.form__repeat').append(newPhone)

                 //init mask

                 initMask();

             })
         })

     }

     /* ==============================================
     show password
     ==============================================*/

     if (document.querySelector('.icon-eye')) {

         document.querySelectorAll('.icon-eye').forEach(item => {
             item.addEventListener('click', e => {

                 const input = item.parentNode.querySelector('input')
                 input.type = (input.type == 'text' ? 'password' : 'text')

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
                 userMenuPopup.open('<div class="user-menu-popup" >' + html + '</div>')
             }

         })

     }

     /* =============================================
     tabs widget
     ===============================================*/

     if (document.querySelector('[data-widget="tabs"]')) {
         const tabs = document.querySelectorAll('[data-widget="tabs"] li')
         const items = document.querySelectorAll('[data-widget="tabs-item"]')

         tabs.forEach((item, index) => {
             item.addEventListener('click', e => {

                 tabs.forEach(item => item.classList.contains('is-active') ? item.classList.remove('is-active') : '')
                 item.classList.add('is-active')

                 items.forEach(item => item.classList.contains('is-active') ? item.classList.remove('is-active') : '')
                 items[index].classList.add('is-active')

             })
         })
     }

     /* =============================================
     shiping repeat
     =============================================*/

     if (document.querySelector('[data-store="shiping-repeat"]')) {

         const elem = document.querySelector('[data-store="shiping-repeat"]')
         const fields = document.querySelector('.shop-block__row')

         function numbering() {
             document.querySelectorAll('.shop-block__row').forEach((item, index) => {
                 if (index) {
                     item.querySelector('.district-name').innerHTML = ' #' + (index + 1)
                 }
             })
         }

         elem.addEventListener('click', e => {

             const countPoint = document.querySelectorAll('.shop-block__row').length

             if (countPoint >= 3) {
                 window.STATUS.err('Допустимо не более 3х регионов')
                 return false
             }

             const cloneElement = fields.cloneNode(true);

             cloneElement.querySelectorAll('select').forEach(select => {

                 select.setAttribute('class', '')
                 select.parentNode.setAttribute('class', '')

                 let item = select.parentNode

                 if (item.querySelector('.select-styled')) {
                     item.querySelector('.select-styled').remove()
                     item.querySelector('.select-list').remove()
                 }

             })

             const removeButton = document.createElement('div')
             removeButton.classList.add('shop-block__remove')
             removeButton.innerHTML = '<span class="remove-field" ></span>'
             removeButton.querySelector('.remove-field').addEventListener('click', e => {
                 if (confirm('Вы действительно хотите удалить ?')) {
                     cloneElement.remove()
                     numbering()
                 }
             })

             cloneElement.append(removeButton)

             if (cloneElement.querySelector('.shop-block__params')) {
                 cloneElement.querySelector('.shop-block__params').innerHTML = ''
                 cloneElement.querySelector('.shop-block__more').innerHTML = 'Параметры доставки'
             }

             const shipParamsInstanse = new ShipingParams(cloneElement)


             fields.parentNode.insertBefore(cloneElement, elem.closest('.shop-block').querySelector('.shop-block__repeat'));

             numbering()

             //init select
             const selectCustomReinit = new afSelect({
                 selector: 'select'
             })

             selectCustomReinit.init()

         })

     }


     /* =============================================
     point order repeat
     =============================================*/

     if (document.querySelector('[data-store="point-repeat"]')) {

         const elem = document.querySelector('[data-store="point-repeat"]')
         const fields = document.querySelector('.shop-block__point')

         function numbering() {
             document.querySelectorAll('.shop-block__point').forEach((item, index) => {
                 if (index) {
                     item.querySelector('.point-number').innerHTML = ' #' + (index + 1)
                 }
             })
         }


         elem.addEventListener('click', e => {

             const countPoint = document.querySelectorAll('.shop-block__point').length

             if (countPoint >= 3) {
                 window.STATUS.err('Допустимо не более 3х ПВЗ')
                 return false
             }

             const cloneElement = fields.cloneNode(true);

             //cloneElement.querySelector('.point-number').innerHTML = ' #' + (countPoint + 1)
             const removeButton = document.createElement('div')
             removeButton.classList.add('shop-block__remove')
             removeButton.innerHTML = '<span class="remove-field" ></span>'

             removeButton.querySelector('.remove-field').addEventListener('click', e => {
                 if (confirm('Вы действительно хотите удалить ?')) {
                     cloneElement.remove()
                     numbering()
                 }
             })

             cloneElement.append(removeButton)

             if (cloneElement.querySelector('.shop-block__params')) {
                 cloneElement.querySelector('.shop-block__params').innerHTML = ''
                 cloneElement.querySelector('.shop-block__more').innerHTML = 'Параметры самовывоза'
             }

             const shipParamsInstanse = new PickupParams(cloneElement)

             fields.parentNode.insertBefore(cloneElement, elem.closest('.shop-block').querySelector('.shop-block__repeat'));

             numbering()
         })

     }

     /* =============================================
     shiping params
     =============================================*/

     class ShipingParams {
         constructor(el) {

             this.formData = null
             this.$el = el

             this.init()
         }

         init() {

             this.addEvent()

             if (this.$el.querySelector('[name="params"]') && this.$el.querySelector('[name="params"]').value) {
                 this.formData = this.$el.querySelector('[name="params"]').value
             }
         }

         openPopup() {

             if (this.formData) {
                 console.log(this.formData)
             }

             const popup = new afLightbox({
                 mobileInBottom: true
             })

             popup.open('<div class="af-spiner" ></div>', (instanse) => {
                 window.ajax({
                     type: 'GET',
                     url: '/store/_shiping-params.html',
                     responseType: 'html',
                     data: {
                         value: 0
                     }
                 }, (status, response) => {
                     popup.changeContent(response)

                     const form = popup.modal.querySelector('form')
                     this.insertForm(form)
                     this.initMask()

                     form.addEventListener('submit', e => {
                         e.preventDefault()

                         let formData = new FormData(form)
                         let object = {};
                         formData.forEach(function (value, key) {
                             object[key] = value;
                         });

                         this.formData = JSON.stringify(object);

                         this.renderInfo()
                         popup.close()
                     })

                 })
             })
         }

         initMask() {

             new MaskInput("[data-masked='days']", {
                 mask: (value) => {

                     if (value[1] == '-') {
                         return '#-##'
                     }


                     return '##-##'

                 },

                 postProcess: (value) => {

                     let arr = [];

                     value.split('-').forEach(num => {
                         Number(num) > 30 ? arr.push(30) : arr.push(num)
                     })

                     return arr.join('-')

                 }
             })



             new MaskInput("[data-masked='time']", {
                 mask: '##:##',


                 postProcess: (value) => {

                     let arr = [];

                     value.split(':').forEach((num, index) => {
                         if (index == 0) Number(num) > 23 ? arr.push(23) : arr.push(num)
                         if (index == 1) Number(num) > 59 ? arr.push(59) : arr.push(num)
                     })

                     return arr.join(':')

                 }

             })



             new MaskInput("[data-masked='number']", {
                 mask: '####',

             })
         }

         insertForm(form) {
             if (this.formData) {
                 const FD = JSON.parse(this.formData)

                 form.querySelector('[name="type"]').value = FD['type'] || ''
                 form.querySelector('[name="cost"]').value = FD['cost'] || ''
                 form.querySelector('[name="days"]').value = FD['days'] || ''
                 form.querySelector('[name="time"]').value = FD['time'] || ''
             }

             form.querySelectorAll('input').forEach((input) => {
                 input.addEventListener('focus', e => {
                     console.log(e.target)

                     //  if (!input) return false;

                     //  let element = input;
                     //  let headerOffset = 0;
                     //  let elementPosition = element.offsetTop
                     //  let offsetPosition = elementPosition - headerOffset;

                     //var offset = input.getBoundingClientRect();

                     setTimeout(() => {
                         document.querySelector('.af-popup').scrollTo({
                             top: input.offsetTop,
                             behavior: "smooth"
                         });
                     }, 300)
                 })
             })
         }

         renderInfo() {
             if (this.formData) {

                 const FD = JSON.parse(this.formData)

                 const str = `${FD['type']} ${FD['cost']} , ${FD['days']}, время перехода – ${FD['time']}`
                 const template = `
                    <label>Параметры доставки</label>
                    <input type="hidden" value='${this.formData}' name="params"> 
                    <div>${str}</div>
                `;

                 const html = document.createElement('div')
                 html.innerHTML = template

                 this.$el.querySelector('.shop-block__params').innerHTML = ''
                 this.$el.querySelector('.shop-block__params').append(html)

                 this.$el.querySelector('.shop-block__more').innerText = 'Изменить'

             } else {
                 this.$el.querySelector('.shop-block__params').innerHTML = ''
             }
         }

         addEvent(elem) {

             this.$el.querySelector('.shop-block__more').addEventListener('click', e => {
                 this.openPopup()
             })
         }
     }

     document.querySelectorAll('.shop-block__row').forEach((item) => {
         new ShipingParams(item)
     })

     /* =============================================
     pickup params
     =============================================*/

     class PickupParams {

         constructor(el) {

             this.formData = null
             this.$el = el

             this.init()
         }

         init() {

             this.addEvent()

             if (this.$el.querySelector('[name="params"]') && this.$el.querySelector('[name="params"]').value) {
                 this.formData = this.$el.querySelector('[name="params"]').value
             }
         }

         initMask() {

             new MaskInput("[data-masked='days']", {
                 mask: (value) => {

                     if (value[1] == '-') {
                         return '#-##'
                     }

                     return '##-##'

                 },

                 postProcess: (value) => {

                     let arr = [];

                     value.split('-').forEach(num => {
                         Number(num) > 30 ? arr.push(30) : arr.push(num)
                     })

                     return arr.join('-')

                 }
             })



             new MaskInput("[data-masked='time']", {
                 mask: '##:##',


                 postProcess: (value) => {

                     let arr = [];

                     value.split(':').forEach((num, index) => {
                         if (index == 0) Number(num) > 23 ? arr.push(23) : arr.push(num)
                         if (index == 1) Number(num) > 59 ? arr.push(59) : arr.push(num)
                     })

                     return arr.join(':')

                 }

             })



             new MaskInput("[data-masked='number']", {
                 mask: '####',

             })
         }

         openPopup() {

             if (this.formData) {
                 console.log(this.formData)
             }

             const popup = new afLightbox({
                 mobileInBottom: true
             })

             popup.open('<div class="af-spiner" ></div>', (instanse) => {
                 window.ajax({
                     type: 'GET',
                     url: '/store/_point-params.html',
                     responseType: 'html',
                     data: {
                         value: 0
                     }
                 }, (status, response) => {
                     popup.changeContent(response)

                     const form = popup.modal.querySelector('form')
                     this.insertForm(form)
                     this.initMask()

                     form.addEventListener('submit', e => {
                         e.preventDefault()

                         let formData = new FormData(form)
                         let object = {};
                         formData.forEach(function (value, key) {
                             object[key] = value;
                         });

                         this.formData = JSON.stringify(object);

                         this.renderInfo()
                         popup.close()
                     })

                 })
             })
         }

         insertForm(form) {
             if (this.formData) {

                 const FD = JSON.parse(this.formData)

                 form.querySelector('[name="cost"]').value = FD['cost'] || ''
                 form.querySelector('[name="days"]').value = FD['days'] || ''
                 form.querySelector('[name="time"]').value = FD['time'] || ''
             }
         }

         renderInfo() {
             if (this.formData) {

                 const FD = JSON.parse(this.formData)

                 const str = `${FD['cost']} , ${FD['days']}, время перехода – ${FD['time']}`
                 const template = `
                   <label>Параметры доставки</label>
                   <input type="hidden" value='${this.formData}' name="params"> 
                   <div>${str}</div>
               `;

                 const html = document.createElement('div')
                 html.innerHTML = template

                 this.$el.querySelector('.shop-block__params').innerHTML = ''
                 this.$el.querySelector('.shop-block__params').append(html)

                 this.$el.querySelector('.shop-block__more').innerText = 'Изменить'

             } else {
                 this.$el.querySelector('.shop-block__params').innerHTML = ''
             }
         }

         addEvent(elem) {

             this.$el.querySelector('.shop-block__more').addEventListener('click', e => {
                 this.openPopup()
             })
         }

     }

     document.querySelectorAll('.shop-block__point').forEach((item) => {
         new PickupParams(item)
     })

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
                 on: {
                     change: function (text, value) {
                         //change event
                     }
                 }
             });
         })


     }
















 });