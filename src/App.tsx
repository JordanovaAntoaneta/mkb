import './App.css';
import PetKompaniiSoNajgolemaPotrosuvacka from './components/PetKompaniiSoNajgolemaPotrosuvacka';
import TrosenjeNaPariIPoeniPoKompanija from './components/TrosenjeNaPariIPoeniPoKompanija';
import { Paper } from '@mui/material';
import { Masonry } from '@mui/lab';
import NajkoristeniPodmoduli from './components/NajkoristeniPodmoduli';
import NajisplatliviPodmoduli from './components/NajisplatliviPodmoduli';
import NacinPlakjanje from './components/NacinPlakjanje';
import GeneriraniBaranjaZaIzvestaiPoStatusBaranje from './components/GeneriraniBaranjaZaIzvestaiPoStatusBaranje';
import AktivnostiPoStatusPretplata from './components/AktivnostiPoStatusPretplata';
import KompaniiKoiKoristelePromoKod from './components/KompaniiKoiKoristelePromoKod';
import KompaniiPretplateniNaPaket from './components/KompaniiPretplateniNaPaket';
import BrojNaAktivniPaketi from './components/BrojNaAktivniPaketi';
import KompaniiKoiDoplatilePoeni from './components/KompaniiKoiDoplatilePoeni';
import TipIzveshtaj from './components/TipIzveshtaj';
import NacinPlakjanjePoTipUsluga from './components/NacinPlakjanjePoTipUsluga';
import TrosenjePoeniPoKompanijaPoModul from './components/TrosenjePoeniPoKompanijaPoModul';
import KorisniciSoNepotvrdenEmail from './components/KorisniciSoNepotvrdenEmail';
import AktivnostPoMesec from './components/AktivnostPoMesec';
import KompaniiKoiDoplatilePoeniPoPretplataNaPaket from './components/DoplateniPoeniPpPretplataNaPaket';

const style = {
  padding: "20px",
  margin: "0px",
  borderRadius: "0px",
  width: "600px",
  height: "fit-content",
  marginBottom: "0",
}

function App() {
  return (
    <div className="App" style={{ padding: '20px' }}>
      <Masonry columns={{ xs: 1, sm: 1, md: 2 }} spacing={3}>
        <Paper elevation={6} square={false} sx={style}>
          <TrosenjeNaPariIPoeniPoKompanija />
        </Paper>
        <Paper elevation={6} square={false} sx={style}>
          <PetKompaniiSoNajgolemaPotrosuvacka />
        </Paper>
        <Paper elevation={6} square={false} sx={style}>
          <NajkoristeniPodmoduli />
        </Paper>
        <Paper elevation={6} square={false} sx={style}>
          <NajisplatliviPodmoduli />
        </Paper>
        <Paper elevation={6} square={false} sx={style}>
          <NacinPlakjanje />
        </Paper>
        <Paper elevation={6} square={false} sx={style}>
          <GeneriraniBaranjaZaIzvestaiPoStatusBaranje />
        </Paper>
        <Paper elevation={6} square={false} sx={style}>
          <AktivnostiPoStatusPretplata />
        </Paper>
        <Paper elevation={6} square={false} sx={style}>
          <KompaniiKoiKoristelePromoKod />
        </Paper>
        <Paper elevation={6} square={false} sx={style}>
          <KompaniiKoiDoplatilePoeni />
        </Paper>
        <Paper elevation={6} square={false} sx={style}>
          <KompaniiKoiDoplatilePoeniPoPretplataNaPaket />
        </Paper>
        <Paper elevation={6} square={false} sx={style}>
          <BrojNaAktivniPaketi />
        </Paper>
        <Paper elevation={6} square={false} sx={style}>
          <KompaniiPretplateniNaPaket />
        </Paper>
        <Paper elevation={6} square={false} sx={style}>
          <TipIzveshtaj />
        </Paper>
        <Paper elevation={6} square={false} sx={style}>
          <NacinPlakjanjePoTipUsluga />
        </Paper>
        <Paper elevation={6} square={false} sx={style}>
          <TrosenjePoeniPoKompanijaPoModul />
        </Paper>
        <Paper elevation={6} square={false} sx={style}>
          <KorisniciSoNepotvrdenEmail />
        </Paper>
        <Paper elevation={6} square={false} sx={style}>
          <AktivnostPoMesec />
        </Paper>
      </Masonry>
    </div>
  );
}

export default App;
