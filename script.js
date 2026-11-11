
'use strict';

// Store all invoice items in an in-memory array
const invoiceItems = [];

const TAX_RATE = 0.18;

// Get HTML elements
const elements = {
  itemForm: document.getElementById('itemForm'),
  itemName: document.getElementById('itemName'),
  itemQuantity: document.getElementById('itemQuantity'),
  itemPrice: document.getElementById('itemPrice'),
  itemsBody: document.getElementById('itemsBody'),
  emptyState: document.getElementById('emptyState'),
  itemCount: document.getElementById('itemCount'),
  subtotal: document.getElementById('subtotal'),
  tax: document.getElementById('tax'),
  grandTotal: document.getElementById('grandTotal'),
  printButton: document.getElementById('printButton'),
  invoiceDate: document.getElementById('invoiceDate'),
  invoiceNumber: document.getElementById('invoiceNumber'),
  statusMessage: document.getElementById('statusMessage')
};

// Format amounts as Indian Rupees
const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2
});

function formatCurrency(amount) {
  return currencyFormatter.format(amount);
}

// Generate a unique ID for each item
function createId() {
  if (window.crypto &&
      typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }

  return `item-${Date.now()}-${Math.random()
    .toString(16).slice(2)}`;
}

// Calculate subtotal using reduce()
function calculateSubtotal() {
  return invoiceItems.reduce((total, item) => {
    return total + item.quantity * item.unitPrice;
  }, 0);
}

// Display invoice items in the HTML table
function renderItems() {
  elements.itemsBody.replaceChildren();

  invoiceItems.forEach((item) => {
    const row = document.createElement('tr');

    row.dataset.itemId = item.id;

    const nameCell = document.createElement('td');
    nameCell.className = 'item-name';
    nameCell.textContent = item.name;

    const quantityCell = document.createElement('td');
    quantityCell.className = 'number-cell';
    quantityCell.textContent = String(item.quantity);

    const priceCell = document.createElement('td');
    priceCell.className = 'number-cell';
    priceCell.textContent = formatCurrency(item.unitPrice);

    const totalCell = document.createElement('td');
    totalCell.className = 'number-cell';
    totalCell.textContent = formatCurrency(
      item.quantity * item.unitPrice
    );

    const actionCell = document.createElement('td');
    actionCell.className = 'action-cell no-print';

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'delete-button';
    deleteButton.dataset.action = 'delete';
    deleteButton.setAttribute(
      'aria-label',
      `Remove ${item.name}`
    );
    deleteButton.title = 'Remove item';
    deleteButton.textContent = '×';

    actionCell.append(deleteButton);

    row.append(
      nameCell,
      quantityCell,
      priceCell,
      totalCell,
      actionCell
    );

    elements.itemsBody.append(row);
  });

  elements.emptyState.hidden = invoiceItems.length > 0;

  elements.itemCount.textContent =
    `${invoiceItems.length} ${
      invoiceItems.length === 1 ? 'item' : 'items'
    }`;

  updateTotals();
}

// Calculate subtotal, tax and grand total
function updateTotals() {
  const subtotal = calculateSubtotal();

  const tax = subtotal * TAX_RATE;

  const grandTotal = subtotal + tax;

  elements.subtotal.textContent =
    formatCurrency(subtotal);

  elements.tax.textContent =
    formatCurrency(tax);

  elements.grandTotal.textContent =
    formatCurrency(grandTotal);
}

// Display messages to the user
function showStatus(message) {
  elements.statusMessage.textContent = message;
}

// ADD ITEM EVENT
elements.itemForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = elements.itemName.value.trim();

  const quantity = Number(
    elements.itemQuantity.value
  );

  const unitPrice = Number(
    elements.itemPrice.value
  );

  if (!name) {
    elements.itemName.focus();
    showStatus('Please enter an item name.');
    return;
  }

  if (!Number.isSafeInteger(quantity) || quantity < 1) {
    elements.itemQuantity.focus();
    showStatus('Quantity must be a whole number greater than zero.');
    return;
  }

  if (!Number.isFinite(unitPrice) || unitPrice < 0) {
    elements.itemPrice.focus();
    showStatus('Enter a valid unit price.');
    return;
  }

  // Create an item object
  const newItem = {
    id: createId(),
    name: name,
    quantity: quantity,
    unitPrice: unitPrice
  };

  // Store the object in the array
  invoiceItems.push(newItem);

  // Refresh the table and totals
  renderItems();

  // Clear the form
  elements.itemForm.reset();

  elements.itemQuantity.value = '1';

  elements.itemName.focus();

  showStatus('Item added to the invoice.');
});

// DELETE ITEM EVENT USING EVENT DELEGATION
elements.itemsBody.addEventListener('click', (event) => {

  // Find the delete button that was clicked
  const deleteButton = event.target.closest(
    'button[data-action="delete"]'
  );

  if (!deleteButton ||
      !elements.itemsBody.contains(deleteButton)) {
    return;
  }

  // Find the corresponding table row
  const row = deleteButton.closest('tr[data-item-id]');

  if (!row) return;

  // Find the item in the JavaScript array using its ID
  const itemIndex = invoiceItems.findIndex((item) => {
    return item.id === row.dataset.itemId;
  });

  if (itemIndex === -1) return;

  // Remove the item from the array
  invoiceItems.splice(itemIndex, 1);

  // Update the table and calculations
  renderItems();

  showStatus('Item removed from the invoice.');
});

// PRINT INVOICE EVENT
elements.printButton.addEventListener('click', () => {

  // Opens the browser print dialog.
  // CSS @media print controls the printed layout.
  window.print();

});

// INITIALIZE INVOICE
function initializeInvoice() {

  const today = new Date();

  const localDate = new Date(
    today.getTime() -
    today.getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 10);

  elements.invoiceDate.value = localDate;

  const datePart = localDate.replaceAll('-', '');

  elements.invoiceNumber.value = `INV-${datePart}`;

  renderItems();
}

// Start the application
initializeInvoice();
