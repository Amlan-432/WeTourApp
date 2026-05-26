import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/AdminService/admin-service';

@Component({
  selector: 'app-admin-customer',
  imports: [CommonModule,FormsModule],
  templateUrl: './admin-customer.html',
  styleUrl: './admin-customer.css',
})
export class AdminCustomer {
  adminservice=inject(AdminService);

users = signal<any[]>([]);
  searchQuery = signal<string>('');
  roleFilter = signal<string>('All'); 

  filteredUsers = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const role = this.roleFilter();
    
    return this.users().filter(user => {
      const name = user.name?.toLowerCase() ?? '';
      const email = user.email?.toLowerCase() ?? '';
      
      const matchesName = name.includes(query) || email.includes(query);
      const matchesRole = role === 'All' || user.role === role;
      
      return matchesName && matchesRole;
    });
  });

  ngOnInit() {
    this.adminservice.getAllUsers().subscribe(res => {
      if (res.success) {
        this.users.set(res.data);
      }
    });
  }





  onRoleChange(userId: string, newRole: string) {
    this.adminservice.changeRole(userId, newRole).subscribe({
      next: (res) => {
        if (res.success) {
          this.users.update(allUsers => 
            allUsers.map(u => u._id === userId ? { ...u, role: newRole } : u)
          );
          console.log('Role updated successfully');
        } else {
          alert('Failed to update role: ' + (res.message || 'Unknown error'));
        }
      },
      error: (err) => {
        alert('An error occurred while updating the role.');
      }
    });
  }

  deleteUser(id: string) {
    //api to delete in database -->>
    //this.users.update(allUsers => allUsers.filter(u => u._id !== id));
  }

  // toggleStatus(user: any) {
  //   this.users.update(allUsers => 
  //     allUsers.map(u => u._id === user._id 
  //       ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } 
  //       : u
  //     )
  //   );
  // }

}
