# flai-api

This is a simple experiment to show the possibility of exploiting third party server as a proxy.
I have used [Heroku](https://www.heroku.com/) hobby dyno server to implement it.

## The link for demo: [flai](https://flai.herokuapp.com/)

## Documentation
### Start

* Paste link into Downloadable box.
* Enter password into Password box as "jvoltci" (without quote).
* Enter extension in next box.
* Submit download button.

### API
```
/play
```
* Use [https://flai.herokuapp.com](https://flai.herokuapp.com/play)/play to stream video file which was last requested for download.

```
/link
```

* Use [https://flai.herokuapp.com](https://flai.herokuapp.com/link)/link to get download link for last request download file.

* Note:- Do change the procces.env.PASS to your any password value!