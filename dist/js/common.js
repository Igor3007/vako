 document.addEventListener("DOMContentLoaded", function (event) {

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


     /* ==============================================
     select
     ============================================== */

     // public methods
     // select.afSelect.open()
     // select.afSelect.close()
     // select.afSelect.update()

     const selectCustom = new customSelect({
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



 });