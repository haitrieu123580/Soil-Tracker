class Product {
    constructor(id, name, type, description, price) {
        this.id = id;
        this.name = name;
        this.type = type; //fert(Fertilizer)/pest(pesticides)
        this.description = description;
        this.price = price;
    }
}

module.exports = Product;