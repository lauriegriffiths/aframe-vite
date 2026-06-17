
## Aframe 

---
## What web experience do you have?

---
### HTML basics
- HTML consists of many `tags`
- They represent things on the page
---
### HTML example 
```html
<h1>My Personal Webpage</h1>

<p>This is a webpage about me</p>
```

- Tags start with `<tagname>` and finish with `</tagname>`
--- 
## HTML tag nesting

```html
<a href="https://mypage.com"><h1>My Personal Webpage</h1></a>
```
- Tags can go inside other tags
- Tags have `attributes` which set certain properties

--- 
## HTML Whitespace

```html
<a href="https://mypage.com"><h1>My Personal Webpage</h1></a>
```
```html
<a href="https://mypage.com">
	<h1>My Personal Webpage</h1>
</a>
```
- The above examples are equivalent
- Newlines, spaces, tabs do not change the meaning

---
## HTML resources
- Mozilla Developers Network (MDN)
- https://developer.mozilla.org/en-US/docs/Web/HTML/Reference

---

## What is Aframe?
- Aframe uses `javascript` to add more tags
- Those tags represent 3D objects
- An easy way to make an interactive 3D scene with minimal coding

---
## A simple scene
```html
<html>
  <head>
    <script src="https://aframe.io/releases/1.7.1/aframe.min.js"></script>
  </head>
  <body>
    <a-scene>
    </a-scene>
  </body>
</html>
```

---
## To save space on slides
```html
<a-scene>
</a-scene>
```

---
## Add a cube
```html
<a-scene>
  <a-box position="-1 0.5 -3" rotation="0 45 0" color="#4CC3D9"></a-box>
</a-scene>
```

---
## Events 
- Check out https://domeventviewer.com/
- There are lots of events firing all the time
- We can make things happen like...
	- Clicking a 3D object
	- Making a sound when objects hit
	- Counting score when a ball drops to the floor
---

## Events with event-set-component
```html
<html>
  <head>
<script src="https://aframe.io/releases/1.7.1/aframe.min.js"></script>
<script src="https://unpkg.com/aframe-event-set-component@5.x.x/dist/aframe-event-set-component.min.js"></script>
<body>
  <a-scene>
    <a-box position="-1 0.5 -3" rotation="0 45 0" color="#4CC3D9"
           event-set__enter="_event: mouseenter; color: #8FF7FF"
           event-set__leave="_event: mouseleave; color: #4CC3D9"></a-box>

    <a-camera>
      <a-entity text="value: Hello, A-Frame; color: #AAFFAA; width: 5; anchor: align"
          position="-0.9 0.2 -3"
          scale="1.5 1.5 1.5"></a-entity>
      <a-cursor></a-cursor>
    </a-camera>
  </a-scene>
</body>
</html>

```
## Add physics
```html
<html>  
  <head>  
    <script src="https://aframe.io/releases/1.7.1/aframe.min.js"></script>  
    <script src="https://unpkg.com/@c-frame/aframe-physics-system@4.2.3/dist/aframe-physics-system.min.js"></script>  
  </head>  
  <body>  
    <a-scene physics>  
      <a-box position="-1 4 -3" rotation="0 45 0" color="#4CC3D9" dynamic-body></a-box>  
      <a-plane position="0 0 -4" rotation="-90 0 0" width="4" height="4" color="#7BC8A4" static-body></a-plane>  
      <a-sky color="#ECECEC"></a-sky>  
    </a-scene>  
  </body>  
</html>
```