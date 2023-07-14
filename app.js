const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const _ = require('lodash');
//mongo admin --eval "db.shutdownServer()"

const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-sandy:santhosh.@cluster0.20xg83z.mongodb.net/todolistDB");

const itemsSchema={
    name: String
}

const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
    name:"Welcome to your To Do list!"
});

const item2=new Item({
    name:"Hit the + button to add new item "
});

const item3=new Item({
    name:"<-- Hit this to delete the item"
});

const defaultItems=[item1,item2,item3]

const listSchema={
    name:String,
    items: [itemsSchema]
};

const List=mongoose.model("List",listSchema);

//ejs import [SET]
app.set("view engine","ejs");

app.get("/",function(req,res){

    Item.find({}).then(function(foundItems){
        if (foundItems.length===0){
            Item.insertMany(defaultItems).then(function () {
                console.log("Successfully saved defult items to DB");
              }).catch(function (err) {
                console.log(err);
              });
            res.redirect("/");
        } else{
            res.render("list",{ListTitle: "Today",newListItems: foundItems});

        }
    })
});


app.get("/:customListName",function(req,res){
    const customListName=_.capitalize(req.params.customListName);

    List.findOne({name:customListName}).then(function(foundList){
        
            if(!foundList){
                //console.log("New DataBase is created!")
                const list=new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/"+customListName);
            }
            else{
                //console.log("Already Exists!")
                res.render("list",{ListTitle: foundList.name,newListItems: foundList.items})
            }
        
    })

  
})

app.post("/",function(req,res){
    
    const task=req.body.todos;
    const listName=req.body.list;
    const item=new Item({
        name: task
    });
    if (listName==="Today"){
    item.save().then(function(){
        res.redirect("/");
    });
    
    }
    else{
        List.findOne({name:listName}).then(function(foundList){
            foundList.items.push(item);
            foundList.save().then(function(){
                res.redirect("/"+listName);
            });
            
        })
    }
    
    // if (req.body.list==="Work"){
    //     workItems.push(item);
    //     res.redirect("/work");
    // } else{
    //     items.push(item);
    //     res.redirect("/");
    // }
    
});

app.post("/delete",function(req,res){
    const checkedItemId= req.body.checkbox;
    const listName=req.body.listName;

    if (listName==="Today"){
        Item.findByIdAndRemove(checkedItemId).then(function(){console.log("Deleted");res.redirect("/");}).catch(function(err){console.log(err);})
        
    }else{
         List.findOneAndUpdate({name: listName},{$pull:{items:{_id: checkedItemId}}}).then(function(foundList){
            res.redirect("/"+listName);
         })
    }
    
});


const port=process.env.PORT || 3000;
app.listen(port,function(){console.log("server running");});


