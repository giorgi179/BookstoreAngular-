import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Admin } from '../../service/admin';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector    : 'app-admin-panel',
  standalone  : false,
  templateUrl : './admin-panel.html',
  styleUrl    : './admin-panel.scss',
})
export class AdminPanel implements OnInit, OnDestroy {
  activeTab  = 'dashboard';
  isLoading  = false;

  dashboard : any   = null;
  books     : any[] = [];
  users     : any[] = [];
  messages  : any[] = [];
  baskets   : any[] = [];
  payments  : any[] = [];
  orders    : any[] = [];

  showBookForm  = false;
  editingBook: any = null;
  bookForm: any = {
    bookUrl: '', title: '', isbn: '', price: 0,
    categoryId: 1, author: '', description: '',
    publisher: '', pageCount: 0,
    publishedDate: new Date().toISOString(),
    language: '', stock: 0,
  };

  // ✅ Polling
  private pollSub: Subscription | null = null;
  private readonly POLL_INTERVAL = 5000; // 5 წამი

  constructor(private adminService: Admin, private router: Router) {}

  ngOnInit(): void {
    const token = sessionStorage.getItem('admin_token');
    if (!token || token.split('.').length !== 3) {
      this.router.navigate(['/admin-login']);
      return;
    }
    this.loadDashboard();
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  // ✅ Polling დაწყება
  startPolling(): void {
    this.pollSub = interval(this.POLL_INTERVAL).subscribe(() => {
      this.silentRefresh();
    });
  }

  // ✅ Polling გაჩერება
  stopPolling(): void {
    if (this.pollSub) {
      this.pollSub.unsubscribe();
      this.pollSub = null;
    }
  }

  // ✅ ჩუმად განახლება — loading spinner-ის გარეშე
  silentRefresh(): void {
    switch (this.activeTab) {
      case 'dashboard': this.silentLoadDashboard(); break;
      case 'books':     this.silentLoadBooks();     break;
      case 'users':     this.silentLoadUsers();     break;
      case 'messages':  this.silentLoadMessages();  break;
      case 'baskets':   this.silentLoadBaskets();   break;
      case 'payments':  this.silentLoadPayments();  break;
      case 'orders':    this.silentLoadOrders();    break;
    }
  }

  setTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'dashboard') this.loadDashboard();
    if (tab === 'books')     this.loadBooks();
    if (tab === 'users')     this.loadUsers();
    if (tab === 'messages')  this.loadMessages();
    if (tab === 'baskets')   this.loadBaskets();
    if (tab === 'payments')  this.loadPayments();
    if (tab === 'orders')    this.loadOrders();
  }

  // ── Dashboard ─────────────────────────────────
  loadDashboard(): void {
    this.adminService.getDashboard().subscribe((res) => (this.dashboard = res));
  }
  silentLoadDashboard(): void {
    this.adminService.getDashboard().subscribe((res) => (this.dashboard = res));
  }

  // ── Books ─────────────────────────────────────
  loadBooks(): void {
    this.adminService.getBooks().subscribe((res) => (this.books = res));
  }
  silentLoadBooks(): void {
    this.adminService.getBooks().subscribe((res) => (this.books = res));
  }

  openAddBook(): void {
    this.editingBook = null;
    this.bookForm = {
      bookUrl: '', title: '', isbn: '', price: 0,
      categoryId: 1, author: '', description: '',
      publisher: '', pageCount: 0,
      publishedDate: new Date().toISOString(),
      language: '', stock: 0,
    };
    this.showBookForm = true;
  }

  openEditBook(book: any): void {
    this.editingBook = book;
    this.bookForm = {
      bookUrl       : book.bookUrl,
      title         : book.title,
      isbn          : book.isbn,
      price         : book.price,
      categoryId    : book.categoryId,
      author        : book.bookDetails?.author        || '',
      description   : book.bookDetails?.description   || '',
      publisher     : book.bookDetails?.publisher     || '',
      pageCount     : book.bookDetails?.pageCount     || 0,
      publishedDate : book.bookDetails?.publishedDate || new Date().toISOString(),
      language      : book.bookDetails?.language      || '',
      stock         : book.stock,
    };
    this.showBookForm = true;
  }

  saveBook(): void {
    if (this.editingBook) {
      this.adminService.updateBook(this.editingBook.id, this.bookForm).subscribe(() => {
        this.showBookForm = false;
        this.loadBooks();        // ✅ მაშინვე განახლება
        this.loadDashboard();    // ✅ dashboard-იც განახლება
      });
    } else {
      this.adminService.createBook(this.bookForm).subscribe(() => {
        this.showBookForm = false;
        this.loadBooks();
        this.loadDashboard();
      });
    }
  }

  deleteBook(id: number): void {
    if (confirm('Are you sure you want to delete this book?')) {
      this.adminService.deleteBook(id).subscribe(() => {
        this.loadBooks();
        this.loadDashboard();
      });
    }
  }

  // ── Users ─────────────────────────────────────
  loadUsers(): void {
    this.adminService.getUsers().subscribe((res) => (this.users = res));
  }
  silentLoadUsers(): void {
    this.adminService.getUsers().subscribe((res) => (this.users = res));
  }

  deleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.adminService.deleteUser(id).subscribe(() => {
        this.loadUsers();
        this.loadDashboard();
      });
    }
  }

  verifyUser(id: number): void {
    this.adminService.verifyUser(id).subscribe(() => this.loadUsers());
  }

  // ── Messages ──────────────────────────────────
  loadMessages(): void {
    this.adminService.getMessages().subscribe((res) => (this.messages = res));
  }
  silentLoadMessages(): void {
    this.adminService.getMessages().subscribe((res) => (this.messages = res));
  }

  deleteMessage(id: number): void {
    this.adminService.deleteMessage(id).subscribe(() => {
      this.loadMessages();
      this.loadDashboard();
    });
  }

  // ── Baskets ───────────────────────────────────
  loadBaskets(): void {
    this.adminService.getBaskets().subscribe((res) => (this.baskets = res));
  }
  silentLoadBaskets(): void {
    this.adminService.getBaskets().subscribe((res) => (this.baskets = res));
  }

  // ── Payments ──────────────────────────────────
  loadPayments(): void {
    this.isLoading = true;
    this.adminService.getPayments().subscribe({
      next: (payments) => {
        const list = [...payments];
        this.adminService.getUsers().subscribe({
          next: (users) => {
            users.forEach((u: any) => {
              if (u.savedCardMasked) {
                list.push({
                  id            : null,
                  cardNumber    : u.savedCardMasked,
                  cardHolderName: u.savedCardHolder ?? '—',
                  expiryDate    : u.savedCardExpiry  ?? '—',
                  cvv           : '***',
                  exactAddress  : '—',
                  amount        : null,
                  paidAt        : null,
                  status        : 'Saved',
                  user          : { fullName: u.fullName, email: u.email },
                  source        : 'user-api',
                });
              }
            });
            this.payments  = list;
            this.isLoading = false;
          },
          error: () => { this.payments = list; this.isLoading = false; },
        });
      },
      error: () => { this.isLoading = false; },
    });
  }

  silentLoadPayments(): void {
    this.adminService.getPayments().subscribe({
      next: (payments) => {
        const list = [...payments];
        this.adminService.getUsers().subscribe({
          next: (users) => {
            users.forEach((u: any) => {
              if (u.savedCardMasked) {
                list.push({
                  id: null, cardNumber: u.savedCardMasked,
                  cardHolderName: u.savedCardHolder ?? '—',
                  expiryDate: u.savedCardExpiry ?? '—',
                  cvv: '***', exactAddress: '—',
                  amount: null, paidAt: null, status: 'Saved',
                  user: { fullName: u.fullName, email: u.email },
                  source: 'user-api',
                });
              }
            });
            this.payments = list;
          },
        });
      },
    });
  }

  deletePayment(id: number): void {
    if (!id) {
      alert('Saved cards cannot be deleted from here. Use User management.');
      return;
    }
    if (confirm('Are you sure you want to delete this payment?')) {
      this.adminService.deletePayment(id).subscribe(() => this.loadPayments());
    }
  }

  // ── Orders ────────────────────────────────────
  loadOrders(): void {
    this.isLoading = true;
    this.adminService.getOrders().subscribe({
      next: (res) => {
        this.orders    = (res ?? []).filter((o: any) => o.amount > 0);
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });
  }

  silentLoadOrders(): void {
    this.adminService.getOrders().subscribe({
      next: (res) => {
        this.orders = (res ?? []).filter((o: any) => o.amount > 0);
      },
    });
  }

  deleteOrder(id: number): void {
    if (confirm('Delete this order?')) {
      this.adminService.deleteOrder(id).subscribe(() => {
        this.loadOrders();
        this.loadDashboard();
      });
    }
  }

  // ── Logout ────────────────────────────────────
  logout(): void {
    this.stopPolling();
    this.adminService.logout();
    this.router.navigate(['/admin-login']);
  }
}