import { Typography } from "@mui/material";
import { ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";

const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
        legend: {
            display: false,
            position: 'top',
        },
        title: {
            display: false,
        },
    },
    scales: {
        x: {
            title: {
                display: true,
                text: 'Вид на барање',
            },
            stacked: true,
            ticks: {
                autoSkip: false,
                maxRotation: 0,
                minRotation: 0,
            },
        },
        y: {
            title: {
                display: true,
                text: 'Број на барања',
            },
            stacked: true,
        },
    },
    layout: {
        padding: {
            bottom: 10,
        },
    },
};

const chartTitleSx = () => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 1,
    fontSize: "1.5rem",
    fontWeight: "bold",
    paddingBottom: 4,
    color: '#32355c',
});

const GeneriraniBaranjaZaIzvestaiPoStatusBaranje: React.FC = () => {

    const data = [
        {
            "statusBaranjeWeb": 3,
            "opisStatusBaranjeWeb": "издаден извештај",
            "statusPretplata": 3,
            "opisStatusPretplata": "истечена претплата",
            "baranjaIzvestai": 10
        },
        {
            "statusBaranjeWeb": 3,
            "opisStatusBaranjeWeb": "издаден извештај",
            "statusPretplata": 2,
            "opisStatusPretplata": "активна претплата",
            "baranjaIzvestai": 8
        },
        {
            "statusBaranjeWeb": 5,
            "opisStatusBaranjeWeb": "откажано барање",
            "statusPretplata": 8,
            "opisStatusPretplata": "откажано плаќање",
            "baranjaIzvestai": 4
        }

    ]

    let aa = {} as { [key: string]: { [key: string]: number[] } }

    const uniqueBaranja = Array.from(new Set(data.map(item => item.statusBaranjeWeb)))

    data.forEach((item) => {
        if (item.baranjaIzvestai < 3000) {
            if (Object.keys(aa).includes(item.opisStatusBaranjeWeb)) {
                aa[item.opisStatusBaranjeWeb] = {
                    ...aa[item.opisStatusBaranjeWeb],
                    [item.opisStatusPretplata]: uniqueBaranja.map(baranje => {
                        if (baranje === item.statusBaranjeWeb) {
                            return item.baranjaIzvestai
                        }
                        return 0;
                    })
                }
            }
            else {
                aa[item.opisStatusBaranjeWeb] = {
                    [item.opisStatusPretplata]: uniqueBaranja.map(baranje => {
                        if (baranje === item.statusBaranjeWeb) {
                            return item.baranjaIzvestai
                        }
                        return 0;
                    })
                }
            }
        }
    })

    const values = Object.values(aa);

    const colors = ['rgb(41, 176, 190)', 'rgba(41, 176, 190, 0.6)', 'rgb(255, 131, 41)'];

    const datasets = [];
    let colorIndex = 0;

    for (const item of values) {
        for (const [key, value] of Object.entries(item)) {
            datasets.push({
                label: key,
                data: value,
                backgroundColor: colors[colorIndex % colors.length],
            });
            colorIndex++;
        }
    }

    const chartData = {
        labels: Object.keys(aa),
        datasets
    }

    return (
        <>
            <Typography component="label" variant="body2" sx={chartTitleSx()}>
                Генерирани барања за извештаи по статус барање
            </Typography>
            <Bar
                data={chartData}
                options={chartOptions}
                height={200}
            />
        </>
    );
};

export default GeneriraniBaranjaZaIzvestaiPoStatusBaranje;
