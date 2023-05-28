const functions = require("firebase-functions");
const admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const express = require("express");
const cors = require("cors");
//Main APP
const app = express();
app.use(cors({ origin:true}));
//Routes
app.get("/", (req,res)=>{
    return res.status(200).send("Hey!");
});


//main db reference
const db =  admin.firestore();

//Create->post()
app.post("/api/create", (req,res) =>{
    (async()=>{
        try{
            await db.collection("userdetails").doc(`/${Date.now()}/`).create({
                id: Date.now(),
                name : req.body.name,
                mobile: req.body.mobile,
                address : req.body.address

            });
            return res.status(200).send({status:"Success", msg:"Data Saved"});
        }catch(error){
            console.log(error)
            return res.status(200).send({status:"Failed", msg:error});

        }
    })();
});

//get -> getZ()
app.get("/api/get/:id",(req,res)=>{
    (async()=>
    {
        try{
            const reqDoc = db.collection("userdetails").doc(req.params.id);
            let userDetail = await reqDoc.get();
            let response = userDetail.data();;
            return res.status(200).send({status:"Success", data:response});
        }catch(error){
            console.log(error)
            return res.status(200).send({status:"Failed", msg:error});

        }

    })();

});


//Fetch everything 
app.get("/api/getAll",(req,res)=>{
    (async()=>
    {
        try{
            const query = db.collection("userdetails");
            let response = [];

            await query.get().then((data)=>{
                let docs = data.docs;

                docs.map((doc)=>{
                    const selectedItem = {
                        name :doc.data().name,
                        mobile:doc.data().mobile,
                        address : doc.data().address   
                    };

                    response.push(selectedItem);
                });
                return response;
            });
            return res.status(200).send({status:"Success", data:response});
        }catch(error){
            console.log(error)
            return res.status(200).send({status:"Failed", msg:error});

        }

    })();

});





//update->put()
app.put("/api/update/:id", (req, res) => {
    (async () => {
      try {
        const reqDoc = db.collection("userdetails").doc(req.params.id);
        await reqDoc.update({
          name: req.body.name,
          mobile: req.body.mobile,
          address: req.body.address,
        });
        return res.status(200).send({ status: "Success", msg: "Data Updated" });
      } catch (error) {
        console.log(error);
        res.status(500).send({ status: "Failed", msg: error });
      }
    })();
  });






//delete->delete()
app.delete("/api/delete/:id", (req, res) => {
    (async () => {
      try {
        const reqDoc = db.collection("userdetails").doc(req.params.id);
        await reqDoc.delete();
        return res.status(200).send({ status: "Success", msg: "Data Removed" });
      } catch (error) {
        console.log(error);
        res.status(500).send({ status: "Failed", msg: error });
      }
    })();
  });

//exports api to firebase cloud functions
exports.app = functions.https.onRequest(app);
