const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const lodash = require("lodash");


const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const itemSchema = {
  name: String,
};
const listSchema = {
  name: String,
  items: [itemSchema],
};

const items = mongoose.model("item", itemSchema);
const List = mongoose.model("List", listSchema);

const sleep = new items({
  name: "Need to sleep",
});
const cook = new items({
  name: "Need to cook",
});
const eat = new items({
  name: "Need to Eat",
});

const defaultItems = [sleep, cook, eat];

app.get("/", function (req, res) {
  items.find(function (err, found) {
    if (found.length === 0) {
      items.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Done");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newItems: found });
    }
  }); 
});

app.get('/favicon.ico', function(req, res) {
  res.sendStatus(204);
});   //to handle "favicon.ico",requests

app.get("/:customListName", function (req, res) {
  const customListName = lodash.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, function (err, found) {
    if (err) {
      console.log(err);
    } else {
      if (found) {
        
        res.render("list",{listTitle:found.name,newItems:found.items})
      } else {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/"+customListName);
      }
    }
  });
});

app.post("/", function (req, res) {
  var item = req.body.add;
  const listName = req.body.list;
  console.log(listName);

  const newItem = new items({
    name: item
  });

 if(listName==="Today")
 {
  newItem.save(function (err) {
    if (err) {
      console.log(err);
    }
  });
  res.redirect("/");
 }
 else{
   List.findOne({name:listName},function(err,foundList){
     
   foundList.items.push(newItem);
   foundList.save(function(err){
     if(err){
       console.log(err)
     }
   });
   res.redirect("/"+listName);
   })
 }
  
});

app.post("/delete", function (req, res) {
  const deleteId = req.body.checkbox;
  const listName = req.body.listName;
  
 if (listName==="Today"){
  items.findByIdAndRemove(deleteId, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("deleted");
    }
  });
  res.redirect("/");
 }else{
   List.findOneAndUpdate({name:listName},{$pull:{items:{_id:deleteId}}},function(err, foundList){
     if(!err){
       console.log(foundList)
       res.redirect("/"+listName);

     }
   })
 }

});
app.post("/newlist",function(req, res){
  const newList = req.body.newList;
  console.log(newList);
  res.redirect("/"+newList);
})

// app.get("/work", function (req, res) {
//   res.render("list", { listTitle: "work list", newItems: work });
// });

// app.get("/about", function (req, res) {
//   res.render("index");
// });

app.listen(3000, function () {
  console.log("server started");
});

// mongoose.connection.close();
