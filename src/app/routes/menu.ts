const Home = {
  text: "Home",
  link: "/home",
  icon: "icon-home",
};

const Dashboard = {
  text: "Perfil Empresa",
  link: "/dashboard",
  icon: "icon-speedometer",
  submenu: [
    {
      text: "Planes",
      link: "/dashboard/v1",
    }
  ],
};

const Pages = {
  text: "Pages",
  link: "/pages",
  icon: "icon-doc",
  submenu: [
    {
      text: "Login",
      link: "/login",
    },
    {
      text: "Register",
      link: "/register",
    },
    {
      text: "Recover",
      link: "/recover",
    },
    {
      text: "Lock",
      link: "/lock",
    },
    {
      text: "404",
      link: "/404",
    },
    {
      text: "500",
      link: "/500",
    },
    {
      text: "Maintenance",
      link: "/maintenance",
    },
  ],
};

const Ecommerce = {
  text: "Ecommerce",
  link: "/ecommerce",
  icon: "icon-basket-loaded",
  submenu: [
    {
      text: "Orders",
      link: "/ecommerce/orders",
    },
    {
      text: "Order View",
      link: "/ecommerce/orderview",
    },
    {
      text: "Products",
      link: "/ecommerce/products",
    },
    {
      text: "Product View",
      link: "/ecommerce/productview",
    },
    {
      text: "Checkout",
      link: "/ecommerce/checkout",
    },
  ],
};

const headingMain = {
  text: "Main Navigation",
  heading: true,
};

const headingMore = {
  text: "More",
  heading: true,
};

export const menu = [
  headingMain,
  Home,
  Dashboard,
  headingMore,
  Pages,
  Ecommerce
];
