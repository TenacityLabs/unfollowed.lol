document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('button1').addEventListener('click', function () {
    alert('clicked')
    var body = document.getElementsByTagName('body')[0].style.backgroundColor = 'aqua'
  })
})