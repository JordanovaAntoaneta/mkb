import { useEffect, useState } from "react";
import { KompaniiKoiKoristelePromoKodInterface } from "../interfaces/KompaniiKoiKoristelePromoKodInterface";
import { Bar } from "react-chartjs-2";
import { Typography } from "@mui/material";
import { ChartOptions } from "chart.js";
import { Link } from "./LinkBase";

const chartTitleSx = () => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 1,
    fontSize: "1.5rem",
    fontWeight: "bold",
    paddingBottom: 4,
    color: '#32355c',
});

function findSecondUpper(str: string) {
    let res: any;
    let flag = true;
    let alphabet = ['А', 'Б', 'В', 'Г', 'Д', 'Ѓ', 'Е', 'Ж', 'З', 'Ѕ', 'И', 'Ј', 'К', 'Л', 'Љ', 'М', 'Н', 'Њ', 'О', 'П', 'Р', 'С', 'Т', 'Ќ', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Џ', 'Ш'];
    for (var i = 0; i < str.length; ++i) {
        if (flag === true) {
            flag = false;
        } else {
            if (alphabet.includes(str[i])) {
                res = i;
                break;
            }
        }
    }
    return res;
}

const transformData = (data: KompaniiKoiKoristelePromoKodInterface[]) => {
    const promoCodeCount = data.reduce((accumulator, item) => {
        const companyName = item.companyName;

        if (!accumulator[companyName]) {
            accumulator[companyName] = 0;
        }
        accumulator[companyName] = item.iskoristeniPromoKodovi;

        return accumulator;
    }, {} as { [companyName: string]: number });

    return Object.keys(promoCodeCount).map((companyName) => ({
        companyName,
        promoCodeCount: promoCodeCount[companyName]
    }));
};

const KompaniiKoiKoristelePromoKod: React.FC = () => {
    const [data, setData] = useState<KompaniiKoiKoristelePromoKodInterface[]>([]);
    const [filteredData, setFilteredData] = useState<KompaniiKoiKoristelePromoKodInterface[]>([]);

    useEffect(() => {
        fetch(`${Link}/api/DataStatistics/KompaniiKoiKoristelePromoKod`, {
            method: "get",
            headers: new Headers({
                "Access-Control-Allow-Origin": "*",
                "ngrok-skip-browser-warning": "69420",
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new TypeError("Received content is not JSON");
                }
                return response.json();
            })
            .then((data: KompaniiKoiKoristelePromoKodInterface[]) => {
                setData(data);
                setFilteredData(data);
            })
            .catch((err) => console.error('Error fetching data:', err));
    }, []);

    const transformedData = transformData(filteredData);

    const chartOptions: ChartOptions<'bar'> = {
        responsive: true,
        indexAxis: 'y',
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
            // Uncomment and modify tooltip logic if needed
            // tooltip: {
            //     callbacks: {
            //         label: function (context) {
            //             let codes: string[] = [];
            //             data.forEach((item: KompaniiKoiKoristelePromoKodInterface) => {
            //                 if (item.companyName === context.label) {
            //                     codes.push(item.iskoristeniPromoKodovi.toString());
            //                 }
            //             });
            //             let arr = new Array();
            //             arr.push(`Компанијата ги употребила следните промо кодови: ${codes.join(', ')}`);
            //             arr.push(`Број на употребени промо кодови: ${context.parsed.y}`);
            //             return arr;
            //         },
            //     }
            // },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Број на употребени промо кодови',
                },
                stacked: false,
                ticks: {
                    autoSkip: false,
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Комапнии кои користеле промо кодови',
                },
                ticks: {
                    autoSkip: false,
                    maxRotation: 0,
                    minRotation: 0,
                    callback: function (tickValue, index, ticks) {
                        let arr = new Array();
                        let indeks: number;
                        ticks.forEach((tick: any) => {
                            if (tick.value === tickValue) {
                                let label = this.getLabelForValue(tick.value);
                                if (label.toString().length >= 18) {
                                    indeks = findSecondUpper(label);
                                    let res = '...' + label.substring(indeks, indeks + 21) + '...';
                                    arr.push(res);
                                }
                            }
                        });
                        return arr;
                    },
                },
            },
        },
        layout: {
            padding: {
                bottom: 10,
            },
        },
    };

    const chartData = {
        labels: transformedData.map((item) => item.companyName),
        datasets: [
            {
                data: transformedData.map((item) => item.promoCodeCount),
                backgroundColor: 'rgb(41, 176, 190)',
                borderWidth: 1,
                axis: 'x',
            },
        ],
    };

    return (
        <>
            <Typography component="label" variant="body2" sx={chartTitleSx()}>
                Компании кои користеле промо кодови
            </Typography>
            <Bar
                data={chartData}
                options={chartOptions}
                height={200}
            />
        </>
    );
};

export default KompaniiKoiKoristelePromoKod;
