import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Userservice } from '../../services/UserService/userservice';

@Component({
  selector: 'app-chat-box',
  imports: [CommonModule,FormsModule],
  templateUrl: './chat-box.html',
  styleUrl: './chat-box.css',
})
export class ChatBox {

  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;
  
  isOpen = signal<boolean>(false);
  userInput = '';
  userService=inject(Userservice);

  toggleChat() {
    this.isOpen.update(val => !val);
  }

  sendMessage() {
   const messageToSend = this.userInput.trim();
   if (messageToSend) {
      this.userInput = ''; 
      debugger;
      this.userService.chatAiMsg(messageToSend).subscribe({
        next: (res) => console.log('AI Response received'),
        error: (err) => console.error('Chat failed', err)
    });
  }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

scrollToBottom(): void {
  setTimeout(() => {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }, 0);
}

}
