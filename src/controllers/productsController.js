const fs = require('fs');
const path = require('path');


const productsFilePath = path.join(__dirname, '../data/productsDataBase.json');
const products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));
const writeJson = (products) => {
	fs.writeFileSync(productsFilePath, JSON.stringify(products), { encoding: "utf-8" })
}

const toThousand = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const controller = {
	// Root - Show all products
	index: (req, res) => {
		res.render("products", { products, toThousand })
	},

	// Detail - Detail from one product
	detail: (req, res) => {
		let productId = Number(req.params.id);

		let product = products.find(product => {
			return product.id == productId;
		})
		res.render("detail", {
			product,
			toThousand
		})
	},

	// Create - Form to create
	create: (req, res) => {
		res.render("product-create-form")
	},

	// Create -  Method to store
	store: (req, res) => {

		/*let lastId = products[products.length - 1].id;

		let newProduct = {
			id: lastId + 1,
			name: req.body.name,
			price: req.body.price,
			discount: req.body.discount,
			category: req.body.category,
			description: req.body.description,
			image: "/default-image.png",
		} */

		const id = Math.max(...products.map(el => el.id))
		const newProduct = {
			id : id + 1,
			...req.body,
			image : req.file ? req.file.filename : "default-image.png",
		}

		products.push(newProduct);
		writeJson(products);
		res.redirect("/products/");
	},

	// Update - Form to edit
	edit: (req, res) => {
		let productId = Number(req.params.id);

		let productToEdit = products.find(product => product.id === productId);

		res.render("product-edit-form", {
			productToEdit,
		})
	},

	// Update - Method to update
	update: (req, res) => {
		
		/* let productId = Number(req.params.id);
		
		products.forEach(product => {
			if (product.id === productId) {
				product.name = req.body.name;
				product.price = req.body.price;
				product.discount = req.body.discount;
				product.category = req.body.category;
				product.description = req.body.description;
				product.image = req.file ? req.file.filename : "default-image.png";
			}
		});
		writeJson(products);

		res.send("Producto editado con exito"); */

		const { id } = req.params
		const { name, price, discount, category, description } = req.body;
		let editProduct = products.find(product => product.id === +id)
		if (req.file){
			if (fs.existsSync(path.join(__dirname, "../../public/images/products", editProduct.image)) && editProduct.image != "default-image.png")
			{
				fs.unlinkSync(path.join(__dirname, "../../public/images/products", editProduct.image)) 
			}
		}

		products.forEach(product => {
			if (product.id === +id) {
				product.name = name,
				product.price = price,
				product.discount = discount,
				product.category = category,
				product.description = description,
				product.image = req.file?.filename ?? product.image
			}
		})

		writeJson(products)
		res.redirect("/products/");	
	},

	// Delete - Delete one product from DB
	destroy: (req, res) => {

		// obtengo el id del req.param
		let productId = Number(req.params.id);

		// busco el producto a eliminar y lo borro del array
		products.forEach(product => {
			if (product.id === productId) {
				let productToDestroy = products.indexOf(product);
				products.splice(productToDestroy, 1)
			}
		})
		// sobreescribo el json con el array de productos modificado
		writeJson(products)

		// retorno un mensaje de exito
		res.send("Producto eliminado con exito")
	}
};

module.exports = controller;