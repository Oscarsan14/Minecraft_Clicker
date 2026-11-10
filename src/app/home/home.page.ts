
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import {
  AlertController, IonFab, IonFabButton, IonFabList,
  IonCol, IonGrid, IonRow, IonContent, IonButton,
  IonCard, IonCardContent, IonLabel, IonList,
  IonThumbnail, IonItem, IonCardHeader, IonCardTitle
} from '@ionic/angular';

import datos from '../../assets/data/picos.json';
import mineralesDatos from '../../assets/data/minerales.json';
import automaticoDatos from '../../assets/data/automatico.json';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonFab, IonFabButton, IonFabList,
    IonCol, IonGrid, IonRow, IonContent,
    IonButton, IonCard, IonCardContent,
    IonLabel, IonList, IonThumbnail, IonItem,
    IonCardHeader, IonCardTitle
  ]
})
export class HomePage implements OnInit, OnDestroy {

  // DATOS DE LA TIENDA
  picos = datos.picos;
  minerales = mineralesDatos.minerales;
  automatico = automaticoDatos;

  categoria = 'picos';

  // BLOQUE ACTUAL
  imagenBloqueActual = 'assets/img/Tierra_Minecraft.png';
  nombreBloqueActual = 'TIERRA';
  bloquesBloqueActual = 1;

  // PRODUCTOS COMPRADOS
  itemsComprados: string[] = [];

  // ESTADÍSTICAS
  Clicks = 0;
  ClicksExtras = 0;
  BloquesMinados = 0;
  ClicksTotales = 0;
  Multiplicador = 1;
  BloquesPorSegundo = 0;

  // ENDER DRAGON
  DragonDesbloqueado = false;
  CombateDragon = false;
  VidaMaximaDragon = 100000;
  VidaDragon = 100000;
  DragonDerrotado = false;

  // NÚMEROS FLOTANTES
  numerosFlotantes: any[] = [];
  contadorNumeros = 0;

  // SONIDOS
  sonidoClick = new Audio('assets/audio/Picar.wav');
  musica = new Audio('assets/audio/musica.mp3');
  musicaActivada = false;

  // TIEMPO DE PARTIDA
  Horas = 0;
  Minutos = 0;
  Segundos = 0;

  temporizador: any;

  constructor(
    private cd: ChangeDetectorRef,
    private alertController: AlertController
  ) { }

  // INICIAR PARTIDA
  ngOnInit() {

    // Recuperar los datos guardados
    this.Clicks = Number(localStorage.getItem('Clicks')) || 0;
    this.ClicksExtras = Number(localStorage.getItem('ClicksExtras')) || 0;
    this.BloquesMinados = Number(localStorage.getItem('BloquesMinados')) || 0;
    this.ClicksTotales = Number(localStorage.getItem('ClicksTotales')) || 0;
    this.Multiplicador = Number(localStorage.getItem('Multiplicador')) || 1;

    this.BloquesPorSegundo =
      Number(localStorage.getItem('BloquesPorSegundo')) || 0;

    this.itemsComprados = JSON.parse(
      localStorage.getItem('itemsComprados') || '[]'
    );

    // Comprobar desbloqueo del dragón a los 100.000 bloques
    this.DragonDesbloqueado = this.BloquesMinados >= 100000;

    // Recuperar estado del combate
    this.CombateDragon =
      localStorage.getItem('CombateDragon') === 'true';

    this.VidaDragon = Number(
      localStorage.getItem('VidaDragon') ?? this.VidaMaximaDragon
    );

    this.DragonDerrotado =
      localStorage.getItem('DragonDerrotado') === 'true';

    // Recuperar bloque actual
    this.imagenBloqueActual =
      localStorage.getItem('imagenBloqueActual') ||
      'assets/img/Tierra_Minecraft.png';

    this.nombreBloqueActual =
      localStorage.getItem('nombreBloqueActual') || 'TIERRA';

    this.bloquesBloqueActual =
      Number(localStorage.getItem('bloquesBloqueActual')) || 1;

    // Recuperar tiempo
    this.Horas = Number(localStorage.getItem('Horas')) || 0;
    this.Minutos = Number(localStorage.getItem('Minutos')) || 0;
    this.Segundos = Number(localStorage.getItem('Segundos')) || 0;

    // Iniciar temporizador
    this.temporizador = setInterval(() => {

      // Generación automática mientras no hay combate
      if (!this.CombateDragon) {

        this.Clicks += this.BloquesPorSegundo;
        this.BloquesMinados += this.BloquesPorSegundo;

        // Comprobar desbloqueo del dragón
        if (this.BloquesMinados >= 100000) {
          this.DragonDesbloqueado = true;
        }
      }

      // Contar tiempo hasta derrotar al dragón
      if (!this.DragonDerrotado) {
        this.calcularTiempo();
      }

      this.guardarDatos();
      this.cd.detectChanges();

    }, 1000);
  }

  // COMPROBAR SI YA ESTÁ COMPRADO
  estaComprado(tipo: string, id: number): boolean {
    return this.itemsComprados.includes(tipo + '-' + id);
  }

  // COMPRAR PRODUCTOS
  comprarItem(tipo: string, Item: any) {

    if (this.estaComprado(tipo, Item.id)) {
      return;
    }

    if (this.Clicks < Item.precio) {
      return;
    }

    // Descontar precio
    this.Clicks -= Item.precio;

    // Guardar producto comprado
    this.itemsComprados.push(tipo + '-' + Item.id);

    if (tipo == 'picos') {

      // Mejorar pico
      this.Multiplicador = Math.max(
        this.Multiplicador,
        Item.bloquesPorClick
      );

    } else if (tipo == 'minerales') {

      // Mejorar bloques por clic
      this.ClicksExtras += Item.bloquesPorClick;

      // Cambiar bloque central
      this.imagenBloqueActual = Item.imagen;
      this.nombreBloqueActual = Item.nombre;
      this.bloquesBloqueActual = Item.bloquesPorClick;

    } else if (tipo == 'automatico') {

      // Solo funciona el mejor automático comprado
      this.BloquesPorSegundo = Math.max(
        this.BloquesPorSegundo,
        Item.bloquesPorSegundo
      );
    }

    this.guardarDatos();
  }

  // CLIC EN EL BLOQUE CENTRAL
  contarClicks(event: MouseEvent) {

    // Reproducir sonido al picar
    const sonido = this.sonidoClick.cloneNode() as HTMLAudioElement;
    sonido.volume = 0.3;
    sonido.play().catch(() => { });

    // Contar clics
    this.ClicksTotales++;

    const bloques = this.Multiplicador + this.ClicksExtras;

    this.Clicks += bloques;
    this.BloquesMinados += bloques;

    // Comprobar desbloqueo del dragón a los 100.000 bloques
    if (this.BloquesMinados >= 100000) {
      this.DragonDesbloqueado = true;
    }

    // Crear número flotante donde se ha hecho clic
    const imagen = event.currentTarget as HTMLElement;
    const bloque = imagen.parentElement!;
    const rect = bloque.getBoundingClientRect();

    const numero = {
      id: this.contadorNumeros++,
      valor: bloques,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    this.numerosFlotantes.push(numero);

    // Eliminar número después de 1,5 segundos
    setTimeout(() => {
      this.numerosFlotantes = this.numerosFlotantes.filter(
        n => n.id !== numero.id
      );
    }, 1500);

    this.guardarDatos();
  }

  // INICIAR COMBATE CONTRA EL DRAGÓN
  iniciarCombateDragon() {

    this.CombateDragon = true;
    this.numerosFlotantes = [];

    this.guardarDatos();
  }

  // GOLPEAR AL ENDER DRAGON
  golpearDragon(event: MouseEvent) {

    if (this.DragonDerrotado || !this.CombateDragon) {
      return;
    }

    // Calcular daño con multiplicadores
    const daño = this.Multiplicador + this.ClicksExtras;

    // Restar vida
    this.VidaDragon = Math.max(0, this.VidaDragon - daño);

    // Contar clic
    this.ClicksTotales++;

    // Reproducir sonido
    const sonido = this.sonidoClick.cloneNode() as HTMLAudioElement;
    sonido.volume = 0.3;
    sonido.play().catch(() => { });

    // Crear número flotante donde se golpea
    const imagen = event.currentTarget as HTMLElement;
    const contenedor = imagen.parentElement!;
    const rect = contenedor.getBoundingClientRect();

    const numero = {
      id: this.contadorNumeros++,
      valor: daño,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    this.numerosFlotantes.push(numero);

    setTimeout(() => {
      this.numerosFlotantes = this.numerosFlotantes.filter(
        n => n.id !== numero.id
      );
    }, 1500);

    // Comprobar victoria
    if (this.VidaDragon <= 0) {
      this.DragonDerrotado = true;
    }

    this.guardarDatos();
  }

  // CALCULAR TIEMPO DE JUEGO
  calcularTiempo() {

    this.Segundos++;

    if (this.Segundos == 60) {
      this.Segundos = 0;
      this.Minutos++;
    }

    if (this.Minutos == 60) {
      this.Minutos = 0;
      this.Horas++;
    }
  }

  // GUARDAR PARTIDA
  guardarDatos() {

    localStorage.setItem('Clicks', String(this.Clicks));
    localStorage.setItem('ClicksExtras', String(this.ClicksExtras));
    localStorage.setItem('BloquesMinados', String(this.BloquesMinados));
    localStorage.setItem('ClicksTotales', String(this.ClicksTotales));
    localStorage.setItem('Multiplicador', String(this.Multiplicador));

    localStorage.setItem(
      'BloquesPorSegundo',
      String(this.BloquesPorSegundo)
    );

    localStorage.setItem(
      'itemsComprados',
      JSON.stringify(this.itemsComprados)
    );

    // Guardar bloque actual
    localStorage.setItem(
      'imagenBloqueActual',
      this.imagenBloqueActual
    );

    localStorage.setItem(
      'nombreBloqueActual',
      this.nombreBloqueActual
    );

    localStorage.setItem(
      'bloquesBloqueActual',
      String(this.bloquesBloqueActual)
    );

    // Guardar tiempo
    localStorage.setItem('Horas', String(this.Horas));
    localStorage.setItem('Minutos', String(this.Minutos));
    localStorage.setItem('Segundos', String(this.Segundos));

    // Guardar combate contra el dragón
    localStorage.setItem(
      'CombateDragon',
      String(this.CombateDragon)
    );

    localStorage.setItem(
      'VidaDragon',
      String(this.VidaDragon)
    );

    localStorage.setItem(
      'DragonDerrotado',
      String(this.DragonDerrotado)
    );
  }

  // REINICIAR PARTIDA
  async reiniciarPartida() {

    const alerta = await this.alertController.create({
      header: 'Reiniciar partida',
      message: '¿Estas seguro? Perderas todo tu progreso.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Reiniciar',
          role: 'destructive',
          handler: () => {

            // Reiniciar compras
            this.itemsComprados = [];

            // Reiniciar estadísticas
            this.Clicks = 0;
            this.ClicksExtras = 0;
            this.BloquesMinados = 0;
            this.ClicksTotales = 0;
            this.Multiplicador = 1;
            this.BloquesPorSegundo = 0;

            // Volver al bloque de tierra
            this.imagenBloqueActual =
              'assets/img/Tierra_Minecraft.png';

            this.nombreBloqueActual = 'TIERRA';
            this.bloquesBloqueActual = 1;

            // Reiniciar tiempo
            this.Horas = 0;
            this.Minutos = 0;
            this.Segundos = 0;

            // Reiniciar dragón
            this.DragonDesbloqueado = false;
            this.CombateDragon = false;
            this.VidaDragon = this.VidaMaximaDragon;
            this.DragonDerrotado = false;

            // Limpiar números flotantes
            this.numerosFlotantes = [];

            // Guardar partida reiniciada
            this.guardarDatos();
            this.cd.detectChanges();
          }
        }
      ]
    });

    await alerta.present();
  }

  // ACTIVAR O DESACTIVAR MÚSICA
  alternarMusica() {

    if (this.musica.paused) {

      this.musica.loop = true;

      this.musica.play().catch(error => {
        console.error('Error al reproducir música:', error);
      });

    } else {

      this.musica.pause();

    }
  }

  // VOLVER AL JUEGO DESDE EL COMBATE
  volverAlJuego() {

    this.CombateDragon = false;
    this.numerosFlotantes = [];

    this.guardarDatos();
  }

  // DETENER TEMPORIZADOR
  ngOnDestroy() {
    clearInterval(this.temporizador);
  }
}
