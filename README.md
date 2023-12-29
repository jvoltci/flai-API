# flai

This is a simple experiment to show the possibility of exploiting third party server as a proxy.
I have used [Render](https://www.render.com/) dyno server to implement it.

## The link for demo: [flai](https://flai-api.onrender.com)

## Documentation
### Start

* Paste link into Download box.
* Enter password into Password box as "jvoltci" (without quote).
* Submit download button.

### API
```
/play
```
* Use [https://flai-api.onrender.com](https://flai-api.onrender.com/)/play/{unique hashed ID} to stream video file which was last generated request for download with unique hashed ID. E.g. https://flai-api.onrender.com/play/kirv41nYfh

```
/link
```

* Use [https://flai-api.onrender.com](https://flai-api.onrender.com/)/link/{unique hashed ID} to get download link for last generated request for download file with unique hashed ID. E.g. https://flai-api.onrender.com/link/kirv41nYfh

* Note:- Do change the procces.env.PASS to your any password value!
* Warning:- This is only for demonstration purpose!
