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
                 console.log(RecoveryPassword.changeContent(response))
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

                 if (steps.length) {

                     // enable first step
                     steps[0].style.display = 'block'

                     //next step
                     registerPopup.modal.querySelectorAll('[data-step="next"]').forEach(element => {
                         element.addEventListener('click', e => {

                             e.preventDefault()

                             let currentStep = e.target.closest('.form-step')
                             currentStep.style.display = 'none'

                             if (currentStep.nextElementSibling) {
                                 currentStep.nextElementSibling.style.display = 'block'
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








 });