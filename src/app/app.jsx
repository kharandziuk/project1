require('isomorphic-fetch')

fetch('/test')
  .then(function(response) {
    if (response.status >= 400) {
      throw new Error("Bad response from server");
                                    }
                      return response.json();
                          })
    .then(function({text}) {
        alert(text)
                  });
