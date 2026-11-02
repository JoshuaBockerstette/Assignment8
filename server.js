const express = require("express");
const crypto = require("node:crypto");

const app = express();
const port = 3000;






// Store everything here while the server is running.
let resources = [];

// Print information about each request.
app.use(function (req, res, next) 
{
  const time = new Date().toISOString();
  console.log(time + " " + req.method + " " + req.originalUrl);
  next();
});

app.use(express.json());









// Check the fields used when creating or updating a resource.
function validResource(body) 
{
  if (!body || typeof body !== "object" || Array.isArray(body)) 
    {
    return false;
  }


  if (typeof body.name !== "string" || body.name.trim() === "") 
  {
    return false;
  }

  if 
  (
    body.description !== undefined &&
    typeof body.description !== "string"
  ) 
  {
    return false;
  }

  return true;
}

// Get all resources.
app.get("/api/resources", function (req, res) 
{
  res.status(200).json(resources);
});








// Get one resource using its ID.
app.get("/api/resources/:id", function (req, res) 
{
  const resource = resources.find(function (item) 
  
  {
    return item.id === req.params.id;
  });

  if (!resource) 
    {
    return res.status(404).json
    ({
      error: "Resource not found"
    });
  }

  res.status(200).json(resource);
});





// Add a new resource.
app.post("/api/resources", function (req, res) 
{
  if (!validResource(req.body)) 
    {
    return res.status(400).json({
      error: "Enter a name and, optionally, a description. Both must be strings."
    });
  }







  const newResource = 
  {
    id: crypto.randomUUID(),
    name: req.body.name.trim(),
    description: req.body.description || ""
  };

  resources.push(newResource);

  res.location("/api/resources/" + newResource.id);
  res.status(201).json(newResource);
});






// Update an existing resource.
app.put("/api/resources/:id", function (req, res) 
{
  const index = resources.findIndex(function (item) 
  {
    return item.id === req.params.id;
  });

  if (index === -1) 
    {
    return res.status(404).json({
      error: "Resource not found"
    });
  }

  if (!validResource(req.body)) 
    {
    return res.status(400).json({
      error: "Enter a name and, optionally, a description. Both must be strings."
    });
  }

  const updatedResource = 
  {
    id: resources[index].id,
    name: req.body.name.trim(),
    description: req.body.description || ""
  };

  resources[index] = updatedResource;

  res.status(200).json(updatedResource);
});







// Delete a resource.
app.delete("/api/resources/:id", function (req, res) 
{
  const index = resources.findIndex(function (item) 
  
  {
    return item.id === req.params.id;
  });

  if (index === -1)
     {
    return res.status(404).json({
      error: "Resource not found"
    });
  }

  resources.splice(index, 1);

  res.status(204).send();
});





// Handle URLs that do not match any endpoint.
app.use(function (req, res) 
{
  res.status(404).json({
    error: "Route not found"
  });
});





// Handle errors, including incorrectly formatted JSON.
app.use(function (err, req, res, next) 
{
  if (err.type === "entity.parse.failed") 
    {
    return res.status(400).json({
      error: "Invalid JSON"
    });
  }

  console.error(err);

  res.status(err.status || 500).json({
    error: "Request could not be processed"
  });
});




app.listen(port, "127.0.0.1", function () 
{
  console.log("Server running at http://127.0.0.1:" + port);
});