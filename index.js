import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import _ from 'lodash';
import {fileURLToPath} from 'url';
import {dirname} from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.use('/css',express.static(__dirname + '/node_modules/bootstrap/dist/css'));

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");
const itemsSchema = new mongoose.Schema({
        name:{
            type:String,
            require:true
        }
});
const listSchema = {
    name:String,
    items:[itemsSchema]
  }

const Item = mongoose.model("Item",itemsSchema);
const List = mongoose.model("List",listSchema);

const random1 = new Item({
    name:"Read a Random WikiHow Article"
});
const random2 = new Item({
    name:"Do a Body Scan Meditation"
});
const random3 = new Item({
    name:"Have a Cold Shower"
});

const defaultItems = [random1,random2,random3];

app.get("/",(req,res)=>{
    Item.find({})
        .then((foundItems)=>{
            if(foundItems.length === 0){
                Item.insertMany(defaultItems)
                .then(()=>{
                    console.log("Succesfully Added");
                })
                .catch((err)=>{
                    console.log(err);
                })
                res.redirect("/");
            }else{
                res.render("index.ejs",{listName:"Today",todoes:foundItems});
            }
        })
        .catch((err)=>{
            console.log(err);
        })
    
})

app.get("/:customListName",(req,res)=>{
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({name:customListName})
        .then((foundList)=>{
            if(!foundList){
                const list = new List({
                    name:customListName,
                    items:defaultItems
                  });
                
                  list.save();
                  console.log("saved");
                  res.redirect("/"+customListName);
            }
            else{
                res.render("index.ejs",{listName:foundList.name,todoes:foundList.items})
            }
        })
})

app.post("/",(req,res)=>{
    const itemName = req.body.newItem;
    const listName = req.body.addBtn;

    const item = new Item({
        name: itemName
    });

    if(listName === "Today"){
            item.save();
            res.redirect("/");
    }else{
        List.findOne({name:listName})
        .then((foundedList)=>{
            foundedList.items.push(item);
            foundedList.save();
            res.redirect("/"+listName);
        })
    }
})

app.post("/deleted",(req,res)=>{
    const deletedItemId = req.body.removeBtn;
    const listName = req.body.listName;
    
    if(listName === "Today"){
        Item.findByIdAndRemove(deletedItemId)
        .then(()=>{
            console.log("Deleted");
        })
        .catch((err)=>{
            console.log(err);
        })
        res.redirect("/");
    }else{
        List.findOneAndUpdate(
            {name:listName},
            {$pull:{items:{_id:deletedItemId}}}
        )
        .then(()=>{
            res.redirect("/"+listName);
            console.log("Deleted Succesfully");
        })
        .catch((err)=>{
            console.log(err);
        })
    }


})


app.listen(port,(err)=>{
    if(err){
        console.log(err);
    }else{
        console.log(`I Love You ${port}`);
    }
})

