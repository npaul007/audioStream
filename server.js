const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('./client'));

app.listen(port || process.env.PORT, function(){
    console.log(`Server listening on port ${port || process.env.PORT}`);
});

app.get(function(req,res) {
    res.sendFile(`${__dirname}/client/index.html`);
});