/*
 * @Author Raymond Pittman
 * @Github: https://github.com/raymondpittman
 * @Note: Added README.md https://gist.github.com/raymondpittman/11cc82788422d1bddfaa62e60e5ec9aa
 */

/*
 * @params
 * @download: http://.zip
 * @filename: ./downloaded.zip
 */
function download(url, filename) {
  fetch(url, {
    mode: "no-cors",
    /*
      * ALTERNATIVE MODE {
      mode: 'cors'
      }
      *
      */
  })
    .then((transfer) => {
      return transfer.blob(); // RETURN DATA TRANSFERED AS BLOB
    })
    .then((bytes) => {
      let elm = document.createElement("a"); // CREATE A LINK ELEMENT IN DOM
      elm.href = URL.createObjectURL(bytes); // SET LINK ELEMENTS CONTENTS
      elm.setAttribute("download", filename); // SET ELEMENT CREATED 'ATTRIBUTE' TO DOWNLOAD, FILENAME PARAM AUTOMATICALLY
      elm.click(); // TRIGGER ELEMENT TO DOWNLOAD
    })
    .catch((error) => {
      console.log(error); // OUTPUT ERRORS, SUCH AS CORS WHEN TESTING NON LOCALLY
    });
}
