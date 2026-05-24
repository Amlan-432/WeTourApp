import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, signal, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { AdminService } from '../../services/AdminService/admin-service';
import { DashboardData } from '../../../Models/adminDashData';
import { Subscription } from 'rxjs';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-stats',
  standalone: true, 
  imports: [CommonModule],
  templateUrl: './admin-stats.html',
  styleUrl: './admin-stats.css',
})
export class AdminStats implements OnInit, OnDestroy {
  adminService = inject(AdminService);

  public dashboardData = signal<DashboardData | null>(null);

  private lineChartRef!: Chart;
  private doughnutChartRef!: Chart;
  private statsSubscription!: Subscription;

  private lineCanvasEl?: HTMLCanvasElement;
  private donutCanvasEl?: HTMLCanvasElement;

  @ViewChild('lineChart', { static: false }) set lineCanvas(content: ElementRef<HTMLCanvasElement> | undefined) {
    if (content) {
      this.lineCanvasEl = content.nativeElement;
      if (this.dashboardData()) {
        this.initOrUpdateLineChart(this.lineCanvasEl, this.dashboardData()!);
      }
    }
  }

  @ViewChild('doughnutChart', { static: false }) set donutCanvas(content: ElementRef<HTMLCanvasElement> | undefined) {
    if (content) {
      this.donutCanvasEl = content.nativeElement;
      if (this.dashboardData()) {
        this.initOrUpdateDonutChart(this.donutCanvasEl, this.dashboardData()!);
      }
    }
  }

  ngOnInit() {
    this.statsSubscription = this.adminService.allstats$.subscribe({
      next: (res) => {
        if (res) {
          this.dashboardData.set(res);
          
          if (this.lineCanvasEl && this.donutCanvasEl) {
            this.initOrUpdateLineChart(this.lineCanvasEl, res);
            this.initOrUpdateDonutChart(this.donutCanvasEl, res);
          }
        }
      },
      error: (err) => console.error('Subscription error:', err)
    });
    const currentYear = new Date().getFullYear().toString();
    const currentMonth = (new Date().getMonth() + 1).toString();
    this.fetchStats(currentMonth, currentYear);
  }

  public onFilterChange(month: string, year: string): void {
    this.fetchStats(month, year);
  }

  private fetchStats(month: string, year: string): void {
    this.adminService.getAllstats(year, month).subscribe({
      error: (err) => console.error('HTTP Error fetching stats:', err)
    });
  }

  private initOrUpdateLineChart(canvas: HTMLCanvasElement, data: DashboardData): void {
    const daysLabels = data.monthlyGraph.map(item => `Day ${item.day}`);
    const bookingCounts = data.monthlyGraph.map(item => item.bookings);

    if (this.lineChartRef) {
      this.lineChartRef.data.labels = daysLabels;
      this.lineChartRef.data.datasets[0].data = bookingCounts;
      this.lineChartRef.update(); 
      return;
    }

    const ctxLine = canvas.getContext('2d');
    if (!ctxLine) return;

    const lineGradient = ctxLine.createLinearGradient(0, 0, 0, 300);
    lineGradient.addColorStop(0, 'rgba(99, 102, 241, 0.35)');
    lineGradient.addColorStop(1, 'rgba(99, 102, 241, 0.00)');

    this.lineChartRef = new Chart(ctxLine, {
      type: 'line',
      data: {
        labels: daysLabels,
        datasets: [{
          label: 'Bookings Volume',
          data: bookingCounts,
          borderColor: '#6366f1',
          borderWidth: 3,
          backgroundColor: lineGradient,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#6366f1',
          pointHoverRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: '#f3f4f6' }, min: 0, ticks: { stepSize: 1 } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  private initOrUpdateDonutChart(canvas: HTMLCanvasElement, data: DashboardData): void {
    const departmentData = [data.department.flights, data.department.hotels, data.department.tours];
    if (this.doughnutChartRef) {
      this.doughnutChartRef.data.datasets[0].data = departmentData;
      this.doughnutChartRef.update();
      return;
    }

    const ctxDonut = canvas.getContext('2d');
    if (!ctxDonut) return;

    this.doughnutChartRef = new Chart(ctxDonut, {
      type: 'doughnut',
      data: {
        labels: ['Flights', 'Hotels', 'Tours'],
        datasets: [{
          data: departmentData,
          backgroundColor: ['#2563eb', '#7c3aed', '#10b981'],
          borderWidth: 4,
          borderColor: '#ffffff',
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, padding: 20 } }
        },
        cutout: '75%'
      }
    });
  }

  ngOnDestroy(): void {
    if (this.statsSubscription) this.statsSubscription.unsubscribe();
    if (this.lineChartRef) this.lineChartRef.destroy();
    if (this.doughnutChartRef) this.doughnutChartRef.destroy();
  }
}