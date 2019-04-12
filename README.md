# flai

This is a simple experiment to show the possibility of exploiting third party server as a proxy.
I have used [Heroku](https://www.heroku.com/) hobby dyno server to implement it.

## The link for demo: [flai](https://flai.ml/)

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
* Use [https://flai.ml](https://flai.ml/#/play)/#/play to stream video file which was last requested for download.

```
/link
```

* Use [https://flai.ml/#](https://flai.ml/#/link)/#/link to get download link for last request download file.

* Note:- Do change the procces.env.PASS to your any password value!
