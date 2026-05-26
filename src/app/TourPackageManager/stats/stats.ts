import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import Chart from 'chart.js/auto';
import { HotelManDashboardData } from '../../../Models/hotelManData';
import { CommonModule } from '@angular/common';
import { PackageService } from '../../services/packageService/package-service';

@Component({
  selector: 'app-stats',
  imports: [CommonModule],
  templateUrl: './stats.html',
  styleUrl: './stats.css',
})
export class Stats {

   revenueChartRef!: ElementRef;
    @ViewChild('revenueChart', { static: false }) set chart(element: ElementRef) {
      if (element) {
        this.revenueChartRef = element;
        if (this.dashboardData()) {
          this.initChart(); 
        }
      }
    }


    packageService = inject(PackageService);

    chartInstance: any;
  dashboardData = signal<HotelManDashboardData| null>(null);

  selectedYear = signal<string>(new Date().getFullYear().toString());
  selectedMonth = signal<string>((new Date().getMonth() + 1).toString());
  years: string[] = ['2026', '2027']; 
  months = [
    { name: 'January', value: '1' }, { name: 'February', value: '2' },
    { name: 'March', value: '3' }, { name: 'April', value: '4' },
    { name: 'May', value: '5' }, { name: 'June', value: '6' },
    { name: 'July', value: '7' }, { name: 'August', value: '8' },
    { name: 'September', value: '9' }, { name: 'October', value: '10' },
    { name: 'November', value: '11' }, { name: 'December', value: '12' }
  ];


  onMonthChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedMonth.set(selectElement.value);
    this.fetchDashboardData();
  }

  onYearChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedYear.set(selectElement.value);
    this.fetchDashboardData();
  }

  getSelectedMonthName(): string {
    return this.months.find(m => m.value === this.selectedMonth())?.name || '';
  }

  ngOnInit() {
    this.packageService.dashStats$.subscribe({
      next: res => {
        if (res) {
          this.dashboardData.set(res);
          setTimeout(() => {
            this.initChart();
          }, 0);
        }
      },
      error: err => {
        console.log(err);
      }
    });
    this.fetchDashboardData();
  }

  ngAfterViewInit() {
    if (this.dashboardData()) {
      this.initChart();
    }
  }

  fetchDashboardData() {
    this.packageService.getPackageDashData(this.selectedYear(), this.selectedMonth()).subscribe();
  }

  initChart() {
    const data = this.dashboardData();
    if (!data || !this.revenueChartRef || !this.revenueChartRef.nativeElement) return;

    const ctx = this.revenueChartRef.nativeElement.getContext('2d');
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const labels = data.monthlyGraphData.map(d => `Day ${d.day}`);
    const revenues = data.monthlyGraphData.map(d => d.revenue);

    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Daily Revenue ($)',
          data: revenues,
          borderColor: '#0dcaf0',      
          backgroundColor: 'rgba(13, 202, 240, 0.1)',
          borderWidth: 2,
          pointBackgroundColor: '#1a1e21',
          pointBorderColor: '#0dcaf0',
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.4 
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#ffffff', 
            titleColor: '#333333',
            bodyColor: '#0dcaf0',
            borderColor: '#e9ecef', 
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            callbacks: { label: (context) => `$${context.parsed.y}` }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0, 0, 0, 0.05)' },
            ticks: { color: '#6c757d', callback: (value) => '$' + value } 
          },
          x: {
            grid: { display: false },
            ticks: { color: '#6c757d', maxTicksLimit: 10 }
          }
        }
      }
    });
  }

}
