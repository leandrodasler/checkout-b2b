import { defineMessages } from 'react-intl'

export const messages = defineMessages({
  order: { id: 'store/checkout.b2b.order' },
  itemCount: { id: 'store/checkout.b2b.itemCount' },
  cancel: { id: 'store/checkout.b2b.cancel' },
  showMore: { id: 'store/checkout.b2b.show-more' },
  showLess: { id: 'store/checkout.b2b.show-less' },
  confirm: { id: 'store/checkout.b2b.confirm' },
  delete: { id: 'store/checkout.b2b.delete' },
  creditAvailable: { id: 'store/checkout.b2b.creditAvailable' },
  noCreditAvailable: { id: 'store/checkout.b2b.noCreditAvailable' },
  editBillingAddress: { id: 'store/checkout.b2b.modal.editBillingAddress' },
  sameAsShipping: { id: 'store/checkout.b2b.modal.sameAsShipping' },
  billingAddress: { id: 'store/checkout.b2b.totalizer.billingAddress' },
  shippingAddress: { id: 'store/checkout.b2b.totalizer.shippingAddress' },
  shippingOption: { id: 'store/checkout.b2b.totalizer.shippingOption' },
  shippingOptionEmpty: {
    id: 'store/checkout.b2b.totalizer.shippingOption.empty',
  },
  emptyAddress: { id: 'store/checkout.b2b.totalizer.emptyAddress' },
  editAddress: { id: 'store/checkout.b2b.totalizer.editAddress' },
  total: { id: 'store/checkout.b2b.totalizer.total' },
  paymentMethods: { id: 'store/checkout.b2b.totalizer.paymentMethods' },
  selectPaymentMethods: {
    id: 'store/checkout.b2b.totalizer.selectPaymentMethods',
  },
  PONumber: { id: 'store/checkout.b2b.totalizer.PONumber' },
  PONumberPlaceholder: {
    id: 'store/checkout.b2b.totalizer.PONumber.placeholder',
  },
  companyName: { id: 'store/checkout.b2b.totalizer.companyName' },
  buyerName: { id: 'store/checkout.b2b.totalizer.buyerName' },
  quotationDiscount: { id: 'store/checkout.b2b.totalizer.quotationDiscount' },
  totalMargin: { id: 'store/checkout.b2b.totalizer.totalMargin' },
  totalDiscount: { id: 'store/checkout.b2b.totalizer.totalDiscount' },
  quotationSurplus: { id: 'store/checkout.b2b.totalizer.quotationSurplus' },
  quotationTotalItems: {
    id: 'store/checkout.b2b.totalizer.quotationTotalItems',
  },
  surplus: { id: 'store/checkout.b2b.totalizer.surplus' },
  totalSurplus: { id: 'store/checkout.b2b.totalizer.totalSurplus' },
  tax: { id: 'store/checkout.b2b.totalizer.tax' },
  name: { id: 'store/checkout.b2b.column.name' },
  quantity: { id: 'store/checkout.b2b.column.quantity' },
  price: { id: 'store/checkout.b2b.column.price' },
  totalPrice: { id: 'store/checkout.b2b.column.totalPrice' },
  category: { id: 'store/checkout.b2b.column.category' },
  brand: { id: 'store/checkout.b2b.column.brand' },
  backToHome: { id: 'store/checkout.b2b.button.backToHome' },
  backToCheckout: { id: 'store/checkout.b2b.button.backToCheckout' },
  refId: { id: 'store/checkout.b2b.column.refId' },
  seller: { id: 'store/checkout.b2b.column.seller' },
  margin: { id: 'store/checkout.b2b.column.margin' },
  withoutStock: { id: 'store/checkout.b2b.withoutStock' },
  emptyCart: { id: 'store/checkout.b2b.empty.cart' },
  clearCart: { id: 'store/checkout.b2b.button.clearCart' },
  removeItem: { id: 'store/checkout.b2b.button.removeItem' },
  searchPlaceholder: { id: 'store/checkout.b2b.search.placeholder' },
  placeOrder: { id: 'store/checkout.b2b.button.placeOrder' },
  placeOrderError: { id: 'store/checkout.b2b.button.placeOrder.error' },
  changeMinimumQuantity: {
    id: 'store/checkout.b2b.quantitySelector.changedMinimumQuantity',
  },
  salesRepresentative: { id: 'store/checkout.b2b.totalizer.salesRep' },
  salesAdmin: { id: 'store/checkout.b2b.totalizer.salesAdm' },
  savedCartsMainTitle: { id: 'store/checkout.b2b.savedCarts.mainTitle' },
  savedCartsTitle: { id: 'store/checkout.b2b.savedCarts.title' },
  savedCartsCurrentLabel: { id: 'store/checkout.b2b.savedCarts.current.label' },
  savedCartsFullScreen: {
    id: 'store/checkout.b2b.savedCarts.fullScreen',
  },
  savedCartsSaveTitle: { id: 'store/checkout.b2b.savedCarts.save-cart.title' },
  savedCartsSavePlaceholder: {
    id: 'store/checkout.b2b.savedCarts.save-cart.placeholder',
  },
  savedCartsSaveDefaultTitle: {
    id: 'store/checkout.b2b.savedCarts.save-cart.default.title',
  },
  savedCartsSaveLabel: { id: 'store/checkout.b2b.savedCarts.save-cart.label' },
  savedCartsSaveSuccess: {
    id: 'store/checkout.b2b.savedCarts.save-cart.success',
  },
  savedCartsUseLabel: { id: 'store/checkout.b2b.savedCarts.use-cart.label' },
  savedCartsUseEmpty: { id: 'store/checkout.b2b.savedCarts.use-cart.empty' },
  savedCartsSelectLabel: {
    id: 'store/checkout.b2b.savedCarts.use-cart.select.label',
  },
  savedCartsInUseLabel: {
    id: 'store/checkout.b2b.savedCarts.use-cart.inUse.label',
  },
  savedCartsSaveCurrent: {
    id: 'store/checkout.b2b.savedCarts.save-cart.current',
  },
  savedCartsSaveNew: {
    id: 'store/checkout.b2b.savedCarts.save-cart.new',
  },
  saveManualPrice: { id: 'store/checkout.b2b.button.saveManualPrice' },
  editManualPrice: { id: 'store/checkout.b2b.button.editManualPrice' },
  manualPriceStopEdit: {
    id: 'store/checkout.b2b.manualPrice.stopEditManualPrice',
  },
  manualPriceSuccess: { id: 'store/checkout.b2b.manualPrice.placeOrder' },
  manualPriceError: { id: 'store/checkout.b2b.manualPrice.placeOrder.error' },
  manualPriceSuccessMessage: {
    id: 'store/checkout.b2b.manualPrice.placeOrder.success',
  },
  manualPriceDiscountExceeded: {
    id: 'store/checkout.b2b.manualPrice.discount-exceeded',
  },
  manualPricePlaceholder: {
    id: 'store/checkout.b2b.manualPrice.input.placeholder',
  },
  createdIn: { id: 'store/checkout.b2b.column.createdIn' },
  items: { id: 'store/checkout.b2b.column.item' },

  searchProductsError: {
    id: 'store/checkout.b2b.search.products.error',
  },
  searchProductsEmpty: {
    id: 'store/checkout.b2b.search.products.empty',
  },
  searchProductsAddAll: {
    id: 'store/checkout.b2b.search.products.addAll',
  },
  searchProductsPlaceholder: {
    id: 'store/checkout.b2b.search.products.placeholder',
  },
  searchProductsToggle: {
    id: 'store/checkout.b2b.search.products.toggle',
  },
  searchProductsGroupToggle: {
    id: 'store/checkout.b2b.search.products.groupToggle',
  },
  searchEmptyCart: {
    id: 'store/checkout.b2b.search.products.EmptyCart',
  },
  totalizerBoxTitle: {
    id: 'store/checkout.b2b.totalizer.boxTitle',
  },
  costCentersLabel: {
    id: 'store/checkout.b2b.cost-centers.label',
  },
  costCenterSingleLabel: {
    id: 'store/checkout.b2b.cost-centers.single.label',
  },
  costCentersNotEmptyError: {
    id: 'store/checkout.b2b.cost-centers.not-empty.error',
  },
  userCostCenterDefaultInfo: {
    id: 'store/checkout.b2b.cost-centers.user-cost-center.default.info',
  },
  costCenterRemoveConfirmation: {
    id: 'store/checkout.b2b.cost-centers.remove.confirmation',
  },
  multipleOrdersTitle: {
    id: 'store/checkout.b2b.cost-centers.multiple-orders.title',
  },
  multipleOrdersLink: {
    id: 'store/checkout.b2b.cost-centers.multiple-orders.order.link',
  },
  availableBalance: {
    id: 'store/checkout.b2b.representative-balance.available-balance.label',
  },
  initialBalance: {
    id: 'store/checkout.b2b.representative-balance.initial-balance.label',
  },
  discountChanges: {
    id: 'store/checkout.b2b.representative-balance.discount-changes.label',
  },
  noBalance: {
    id: 'store/checkout.b2b.representative-balance.no-balance.fallback',
  },
  balanceError: {
    id: 'store/checkout.b2b.representative-balance.error-message.label',
  },
  appTitle: {
    id: 'admin/checkout-b2b.title',
  },
  representativeBalance: {
    id: 'admin/representativebalances.title',
  },
  saveBalancesButton: {
    id: 'admin/representativebalances.button.save-balances',
  },
  editBalancesButton: {
    id: 'admin/representativebalances.button.edit-balances',
  },
  cancelEditButton: {
    id: 'admin/representativebalances.button.cancel-edit',
  },
  representativeBalanceError: { id: 'admin/representativebalances.error' },
  representativeBalanceNegativeError: {
    id: 'admin/representativebalances.negative-balance',
  },
  representativeBalanceEmail: { id: 'admin/representativebalances.email' },
  representativeBalanceValue: { id: 'admin/representativebalances.balance' },
  representativeBalanceCreatedIn: {
    id: 'admin/representativebalances.createdIn',
  },
  representativeBalanceLastInteractionIn: {
    id: 'admin/representativebalances.lastInteractionIn',
  },
  representativeBalanceSettingsError: {
    id: 'admin/representativebalances.settings.error',
  },
  representativeBalanceSettingsSuccess: {
    id: 'admin/representativebalances.settings.success',
  },
  representativeBalanceSettingsEnabled: {
    id: 'admin/representativebalances.settings.enabled',
  },
  representativeBalanceSettingsAllowNegative: {
    id: 'admin/representativebalances.settings.allowNegative',
  },
  representativeBalanceSettingsOpeningBalance: {
    id: 'admin/representativebalances.settings.openingBalance',
  },
  representativeBalanceSettingsSave: {
    id: 'admin/representativebalances.settings.save',
  },
  shareCartButton: { id: 'store/checkout.b2b.share-cart.button' },
  shareCartSubject: { id: 'store/checkout.b2b.share-cart.subject' },
  shareCartTitle: { id: 'store/checkout.b2b.share-cart.title' },
  shareCartLink: { id: 'store/checkout.b2b.share-cart.link' },
  shareCartSentBy: { id: 'store/checkout.b2b.share-cart.sentBy' },
  shareCartUser: { id: 'store/checkout.b2b.share-cart.user' },
  shareCartRole: { id: 'store/checkout.b2b.share-cart.role' },
  shareCartRegards: { id: 'store/checkout.b2b.share-cart.regards' },
  shareCartSuccess: { id: 'store/checkout.b2b.share-cart.success' },
  shareCartModalTitle: { id: 'store/checkout.b2b.share-cart.modalTitle' },
  shareCartLabel: { id: 'store/checkout.b2b.share-cart.label' },
  shareCartEmail: { id: 'store/checkout.b2b.share-cart.email' },
  shareCartEmailPlaceholder: {
    id: 'store/checkout.b2b.share-cart.email.placeholder',
  },
  shareCartEmailOriginUser: {
    id: 'store/checkout.b2b.share-cart.email-origin.user',
  },
  shareCartEmailOriginUserPlaceholder: {
    id: 'store/checkout.b2b.share-cart.email-origin.user.placeholder',
  },
  shareCartEmailOriginInput: {
    id: 'store/checkout.b2b.share-cart.email-origin.input',
  },
  shareCartInvalidEmail: {
    id: 'store/checkout.b2b.share-cart.invalid.email',
  },
})
